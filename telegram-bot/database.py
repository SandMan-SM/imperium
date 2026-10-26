import os
import aiosqlite
from typing import Optional, Dict, Any

DB_PATH = os.path.join(os.path.dirname(__file__), "imperium.db")

# Columns added after the first release. They are added to an existing
# database on start, so a deploy never loses the progress already recorded.
MEMBERSHIP_COLUMNS = (
    ("email", "TEXT"),
    ("is_member", "BOOLEAN DEFAULT 0"),
    ("member_checked_at", "REAL"),
)


async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute('''
            CREATE TABLE IF NOT EXISTS users (
                user_id INTEGER PRIMARY KEY,
                username TEXT,
                current_phase INTEGER DEFAULT 1,
                current_unit INTEGER DEFAULT 1,
                progress_percentage INTEGER DEFAULT 0,
                join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                completion_status BOOLEAN DEFAULT 0,
                email TEXT,
                is_member BOOLEAN DEFAULT 0,
                member_checked_at REAL
            )
        ''')

        # An existing database was created before the membership columns
        # existed. Add the ones that are missing; SQLite has no IF NOT EXISTS
        # for columns, so the table is inspected first.
        async with db.execute("PRAGMA table_info(users)") as cursor:
            existing = {row[1] for row in await cursor.fetchall()}

        for column, definition in MEMBERSHIP_COLUMNS:
            if column not in existing:
                await db.execute(f"ALTER TABLE users ADD COLUMN {column} {definition}")

        await db.commit()

async def register_user(user_id: int, username: str) -> None:
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute('''
            INSERT OR IGNORE INTO users (user_id, username, current_phase, current_unit, progress_percentage, completion_status)
            VALUES (?, ?, 1, 1, 0, 0)
        ''', (user_id, username))
        await db.commit()

async def get_user(user_id: int) -> Optional[Dict[str, Any]]:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute('SELECT * FROM users WHERE user_id = ?', (user_id,)) as cursor:
            row = await cursor.fetchone()
            if row:
                return dict(row)
            return None

async def update_user_progress(user_id: int, phase: int, unit: int, percentage: int, completed: bool = False) -> None:
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute('''
            UPDATE users
            SET current_phase = ?, current_unit = ?, progress_percentage = ?, completion_status = ?
            WHERE user_id = ?
        ''', (phase, unit, percentage, completed, user_id))
        await db.commit()

async def reset_user(user_id: int) -> None:
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute('''
            UPDATE users
            SET current_phase = 1, current_unit = 1, progress_percentage = 0, completion_status = 0
            WHERE user_id = ?
        ''', (user_id,))
        await db.commit()

async def set_membership(user_id: int, email: Optional[str], is_member: bool, checked_at: float) -> None:
    """Records the address on file and whether it holds a paid membership."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute('''
            UPDATE users
            SET email = ?, is_member = ?, member_checked_at = ?
            WHERE user_id = ?
        ''', (email, int(is_member), checked_at, user_id))
        await db.commit()
