import os
import aiosqlite
from typing import Optional, Dict, Any

DB_PATH = os.path.join(os.path.dirname(__file__), "imperium.db")

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
                completion_status BOOLEAN DEFAULT 0
            )
        ''')
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
