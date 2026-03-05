from telegram import Update
from telegram.ext import ContextTypes
import database
from utils.helpers import calculate_progress_percentage

async def progress_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    db_user = await database.get_user(user.id)
    if not db_user:
        await update.message.reply_text("User not found. Try /start first.")
        return
        
    current_phase = db_user["current_phase"]
    current_unit = db_user["current_unit"]
    completion_status = db_user["completion_status"]
    
    pct = calculate_progress_percentage(current_unit, completion_status)
    if completion_status:
        text = "Your progress: 100%.\nYou have completed Imperium.\nYour legacy is established."
    else:
        text = f"Current Phase: {current_phase}\nCurrent Unit: {current_unit}/28\nOverall Progress: {pct}%"
        
    await update.message.reply_text(text)

async def phases_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    from utils.helpers import build_phase_keyboard
    
    user = update.effective_user
    db_user = await database.get_user(user.id)
    if not db_user:
        return
        
    current_phase = db_user["current_phase"]
    keyboard = build_phase_keyboard(current_phase)
    await update.message.reply_text("Imperium Phases:", reply_markup=keyboard)
