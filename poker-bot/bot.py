import base64
import hashlib
import json
import logging
import os
import sqlite3
import tempfile
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
from openai import AsyncOpenAI
from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.constants import ChatAction
from telegram.ext import Application, CallbackQueryHandler, CommandHandler, ContextTypes, MessageHandler, filters


BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-5.5").strip()
HERMES_SESSION_NAME = os.getenv("HERMES_SESSION_NAME", "poker-hermes").strip()
ALLOWED_TELEGRAM_USER_IDS = {
    int(value.strip())
    for value in os.getenv("ALLOWED_TELEGRAM_USER_IDS", "").split(",")
    if value.strip().isdigit()
}

LOG_DIR = BASE_DIR / "logs"
RUN_DIR = BASE_DIR / "run"
DB_PATH = BASE_DIR / "hermes-poker.db"
LOG_DIR.mkdir(exist_ok=True)
RUN_DIR.mkdir(exist_ok=True)

logging.basicConfig(
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
    level=logging.INFO,
    handlers=[
        logging.FileHandler(LOG_DIR / "hermes.log"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger("hermes-poker")

client = AsyncOpenAI(api_key=OPENAI_API_KEY)


SYSTEM_PROMPT = """
You are Hermes, a poker decision-support analyst.

Analyze the table screenshot and any user caption. Return a concise recommendation for Texas Hold'em.

Skill standard:
- Think like an elite GTO-aware cash/tournament coach: range advantage, nut advantage, blockers, SPR, stack depth, pot odds, implied odds, fold equity, position, preflop charts, exploitative adjustments, ICM when tournament context is visible, and rake sensitivity in small pots.
- Prefer robust actions when screenshot details are uncertain.
- When the table is online/live poker and the site context is unclear, avoid any claim that this beats the pool. Give the best strategic decision from visible information.

Rules:
- If critical details are unreadable, say what is missing and give the best conditional recommendation.
- Focus on legal, fair-play decision support and study. Do not claim certainty or guaranteed profit.
- Do not encourage bankroll recklessness or chasing losses.
- Use plain text. Keep it short enough for Telegram.

Output format:
State read:
Best move:
Sizing:
Why:
Watchouts:
""".strip()


def db_connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with db_connect() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS hands (
                hand_id TEXT PRIMARY KEY,
                chat_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                caption TEXT NOT NULL,
                advice TEXT NOT NULL,
                feedback TEXT,
                note TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )
        conn.execute("CREATE INDEX IF NOT EXISTS idx_hands_chat_created ON hands(chat_id, created_at)")


def new_hand_id(chat_id: int, image_bytes: bytes) -> str:
    seed = f"{chat_id}:{datetime.now(timezone.utc).isoformat()}".encode("utf-8") + image_bytes[:2048]
    return hashlib.sha256(seed).hexdigest()[:12]


def save_hand(hand_id: str, chat_id: int, user_id: int, caption: str, advice: str) -> None:
    now = datetime.now(timezone.utc).isoformat()
    with db_connect() as conn:
        conn.execute(
            """
            INSERT INTO hands (hand_id, chat_id, user_id, caption, advice, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (hand_id, chat_id, user_id, caption, advice, now, now),
        )


def record_feedback(hand_id: str, feedback: str, note: str = "") -> bool:
    now = datetime.now(timezone.utc).isoformat()
    with db_connect() as conn:
        result = conn.execute(
            "UPDATE hands SET feedback = ?, note = ?, updated_at = ? WHERE hand_id = ?",
            (feedback, note, now, hand_id),
        )
        return result.rowcount > 0


def learning_context(chat_id: int) -> str:
    with db_connect() as conn:
        totals = conn.execute(
            """
            SELECT feedback, COUNT(*) AS count
            FROM hands
            WHERE chat_id = ? AND feedback IS NOT NULL
            GROUP BY feedback
            """,
            (chat_id,),
        ).fetchall()
        winners = conn.execute(
            """
            SELECT caption, advice, note
            FROM hands
            WHERE chat_id = ? AND feedback IN ('worked', 'won')
            ORDER BY updated_at DESC
            LIMIT 5
            """,
            (chat_id,),
        ).fetchall()
        misses = conn.execute(
            """
            SELECT caption, advice, note
            FROM hands
            WHERE chat_id = ? AND feedback IN ('missed', 'lost')
            ORDER BY updated_at DESC
            LIMIT 5
            """,
            (chat_id,),
        ).fetchall()

    if not totals and not winners and not misses:
        return "No local feedback yet."

    total_text = ", ".join(f"{row['feedback']}={row['count']}" for row in totals) or "none"
    lines = [f"Local outcome memory for this chat. Use as a weak exploitative prior, not as proof: {total_text}."]
    if winners:
        lines.append("Recent advice marked useful:")
        lines.extend(f"- Context: {row['caption'][:160]} | Advice: {row['advice'][:220]} | Note: {(row['note'] or '')[:120]}" for row in winners)
    if misses:
        lines.append("Recent advice marked bad:")
        lines.extend(f"- Context: {row['caption'][:160]} | Advice: {row['advice'][:220]} | Note: {(row['note'] or '')[:120]}" for row in misses)
    return "\n".join(lines)


def validate_config() -> None:
    missing = []
    if not TELEGRAM_BOT_TOKEN or TELEGRAM_BOT_TOKEN == "paste_your_botfather_token_here":
        missing.append("TELEGRAM_BOT_TOKEN")
    if not OPENAI_API_KEY or OPENAI_API_KEY == "paste_your_openai_api_key_here":
        missing.append("OPENAI_API_KEY")
    if missing:
        raise RuntimeError(f"Missing required config in {BASE_DIR / '.env'}: {', '.join(missing)}")


def write_session_file() -> None:
    payload = {
        "name": HERMES_SESSION_NAME,
        "service": "telegram-poker-bot",
        "pid": os.getpid(),
        "started_at": datetime.now(timezone.utc).isoformat(),
        "model": OPENAI_MODEL,
        "log_file": str(LOG_DIR / "hermes.log"),
    }
    (RUN_DIR / "hermes-session.json").write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")


def allowed(update: Update) -> bool:
    user = update.effective_user
    if not ALLOWED_TELEGRAM_USER_IDS:
        return True
    return bool(user and user.id in ALLOWED_TELEGRAM_USER_IDS)


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not allowed(update):
        await update.message.reply_text("Not authorized.")
        return
    await update.message.reply_text(
        "Hermes poker session is live. Send a poker screenshot/photo and add any missing context in the caption. After a hand, tap feedback so I can adapt."
    )


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not allowed(update):
        await update.message.reply_text("Not authorized.")
        return
    await update.message.reply_text(
        "Send a table screenshot. Useful caption: stakes, position, stack sizes, reads, action before you. Use /result HAND_ID won|lost|worked|missed optional note to teach me."
    )


async def stats_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not allowed(update):
        await update.message.reply_text("Not authorized.")
        return
    await update.message.reply_text(learning_context(update.effective_chat.id)[:3900])


async def result_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not allowed(update):
        await update.message.reply_text("Not authorized.")
        return
    if len(context.args) < 2:
        await update.message.reply_text("Use: /result HAND_ID won|lost|worked|missed optional note")
        return

    hand_id = context.args[0].strip()
    feedback = context.args[1].strip().lower()
    note = " ".join(context.args[2:]).strip()
    valid = {"won", "lost", "worked", "missed"}
    if feedback not in valid:
        await update.message.reply_text("Feedback must be one of: won, lost, worked, missed")
        return

    if record_feedback(hand_id, feedback, note):
        await update.message.reply_text(f"Logged {feedback} for {hand_id}.")
    else:
        await update.message.reply_text(f"I could not find hand {hand_id}.")


async def analyze_text(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not allowed(update):
        await update.message.reply_text("Not authorized.")
        return
    await update.message.reply_text("Send a screenshot/photo so I can read the table state.")


async def analyze_photo(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not allowed(update):
        await update.message.reply_text("Not authorized.")
        return

    message = update.effective_message
    caption = message.caption or "No caption supplied."
    photo = message.photo[-1]

    status = await message.reply_text("Reading the table now. I will send the move as soon as the screenshot is parsed.")
    await context.bot.send_chat_action(chat_id=message.chat_id, action=ChatAction.TYPING)

    with tempfile.NamedTemporaryFile(suffix=".jpg") as tmp:
        telegram_file = await context.bot.get_file(photo.file_id)
        await telegram_file.download_to_drive(tmp.name)
        image_bytes = Path(tmp.name).read_bytes()

    image_b64 = base64.b64encode(image_bytes).decode("ascii")
    hand_id = new_hand_id(message.chat_id, image_bytes)
    local_learning = learning_context(message.chat_id)

    try:
        response = await client.responses.create(
            model=OPENAI_MODEL,
            input=[
                {
                    "role": "system",
                    "content": [{"type": "input_text", "text": SYSTEM_PROMPT}],
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "input_text",
                            "text": (
                                f"Hand ID: {hand_id}\n"
                                f"Caption/context from Telegram: {caption}\n\n"
                                f"{local_learning}"
                            ),
                        },
                        {
                            "type": "input_image",
                            "image_url": f"data:image/jpeg;base64,{image_b64}",
                        },
                    ],
                },
            ],
        )
    except Exception as exc:
        logger.exception("OpenAI analysis failed")
        await status.edit_text(f"Analysis failed: {exc}")
        return

    answer = response.output_text.strip() if response.output_text else "No recommendation returned."
    answer = f"Hand {hand_id}\n\n{answer}"
    save_hand(hand_id, message.chat_id, update.effective_user.id, caption, answer)

    keyboard = InlineKeyboardMarkup(
        [
            [
                InlineKeyboardButton("Worked", callback_data=f"fb:worked:{hand_id}"),
                InlineKeyboardButton("Missed", callback_data=f"fb:missed:{hand_id}"),
            ],
            [
                InlineKeyboardButton("Won", callback_data=f"fb:won:{hand_id}"),
                InlineKeyboardButton("Lost", callback_data=f"fb:lost:{hand_id}"),
            ],
        ]
    )
    await status.edit_text(answer[:3900], reply_markup=keyboard)


async def handle_feedback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    if not allowed(update):
        await query.edit_message_reply_markup(reply_markup=None)
        await query.message.reply_text("Not authorized.")
        return

    _, feedback, hand_id = query.data.split(":", 2)
    if record_feedback(hand_id, feedback):
        await query.message.reply_text(f"Logged {feedback} for {hand_id}. Future hands will use that signal.")
    else:
        await query.message.reply_text(f"I could not find hand {hand_id}.")


def main() -> None:
    validate_config()
    init_db()
    write_session_file()

    application = Application.builder().token(TELEGRAM_BOT_TOKEN).build()
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("stats", stats_command))
    application.add_handler(CommandHandler("result", result_command))
    application.add_handler(CallbackQueryHandler(handle_feedback, pattern=r"^fb:"))
    application.add_handler(MessageHandler(filters.PHOTO, analyze_photo))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, analyze_text))

    logger.info("Hermes poker session '%s' starting with model %s", HERMES_SESSION_NAME, OPENAI_MODEL)
    application.run_polling()


if __name__ == "__main__":
    main()
