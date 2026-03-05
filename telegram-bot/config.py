import os
import logging
from dotenv import load_dotenv

load_dotenv()

# Environment variables
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
ADMIN_USER_ID = os.getenv("ADMIN_USER_ID")

# Logging setup
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)
logger = logging.getLogger(__name__)

# To avoid exposing secrets in logs or print statements
def validate_config():
    if not TELEGRAM_BOT_TOKEN:
        logger.error("No TELEGRAM_BOT_TOKEN configured.")
        raise ValueError("No TELEGRAM_BOT_TOKEN configured.")
