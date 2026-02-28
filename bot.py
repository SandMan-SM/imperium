import os
import asyncio
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, ContextTypes, CallbackQueryHandler
from database import register_user, get_user
from phases import COURSE_CONTENT

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    # Ensure this function matches your database.py names
    await register_user(user.id, user.username)
    
    keyboard = [[InlineKeyboardButton("🚀 Begin Phase I", callback_data="phase_1")]]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        f"Welcome to Imperium, {user.first_name}.\n\nYour trajectory starts here. "
        "The 28 Principles are designed to rebuild your core directive.",
        reply_markup=reply_markup
    )

def main():
    token = os.environ.get("BOT_TOKEN")
    if not token:
        print("ERROR: No BOT_TOKEN found in environment variables.")
        return

    application = Application.builder().token(token).build()
    application.add_handler(CommandHandler("start", start))
    
    print("Imperium Bot is starting...")
    application.run_polling()

if __name__ == "__main__":
    main()
