from telegram import Update
from telegram.ext import ContextTypes
import database
from utils.helpers import get_main_menu_keyboard

async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    await database.register_user(user.id, user.username)
    
    text = (f"Welcome to Imperium, {user.first_name}.\n\n"
            "Your trajectory starts here. The 28 Principles are designed to rebuild your core directive.\n\n"
            "Use the menu below to navigate.")
    
    await update.message.reply_text(text, reply_markup=get_main_menu_keyboard())
