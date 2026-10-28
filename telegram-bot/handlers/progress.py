from telegram import Update
from telegram.ext import ContextTypes
import database
from access import resolve_access
from utils.helpers import calculate_progress_percentage

def progress_text(db_user) -> str:
    """The progress line, in one place, so /progress and the menu button agree."""
    current_phase = db_user["current_phase"]
    current_unit = db_user["current_unit"]
    completion_status = db_user["completion_status"]

    pct = calculate_progress_percentage(current_unit, completion_status)
    if completion_status:
        return "Your progress: 100%.\nYou have completed Imperium.\nYour legacy is established."

    return (
        f"Current Phase: {current_phase}\n"
        f"Current Unit: {current_unit}/28\n"
        f"Overall Progress: {pct}%"
    )


async def progress_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    db_user = await database.get_user(user.id)
    if not db_user:
        await update.message.reply_text("User not found. Try /start first.")
        return

    await update.message.reply_text(progress_text(db_user))

async def phases_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    from utils.helpers import build_phase_keyboard

    user = update.effective_user
    db_user = await database.get_user(user.id)
    if not db_user:
        return

    access = await resolve_access(db_user)
    current_phase = db_user["current_phase"]
    keyboard = build_phase_keyboard(
        current_phase,
        member=access["member"],
        free_unit=access["free_unit"],
    )
    await update.message.reply_text("Imperium Phases:", reply_markup=keyboard)
