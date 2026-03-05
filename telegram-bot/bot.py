import logging
import asyncio
from telegram.ext import Application, CommandHandler, CallbackQueryHandler
from config import TELEGRAM_BOT_TOKEN, validate_config
import database

from handlers.start import start_command
from handlers.navigation import handle_callback
from handlers.progress import progress_command, phases_command

logger = logging.getLogger(__name__)

def main():
    validate_config()
    
    # Initialize DB
    loop = asyncio.get_event_loop()
    loop.run_until_complete(database.init_db())
    
    application = Application.builder().token(TELEGRAM_BOT_TOKEN).build()
    
    # Register Commands
    application.add_handler(CommandHandler("start", start_command))
    application.add_handler(CommandHandler("progress", progress_command))
    application.add_handler(CommandHandler("phases", phases_command))
    
    # Register Callbacks (Inline keyboards)
    application.add_handler(CallbackQueryHandler(handle_callback))
    
    logger.info("Imperium Bot is starting...")
    application.run_polling()

if __name__ == "__main__":
    main()
