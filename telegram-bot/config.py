import os
import logging
from dotenv import load_dotenv

load_dotenv()

# Environment variables
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
ADMIN_USER_ID = os.getenv("ADMIN_USER_ID")

# The Imperium website — the system of record for membership.
# The bot asks the site whether an address holds a paid membership, because
# the site holds the Stripe ledger and the Supabase rows. The bot keeps no
# premium flag of its own.
IMPERIUM_SITE_URL = (os.getenv("IMPERIUM_SITE_URL") or "https://secretimperium.com").rstrip("/")

# Shared secret for the membership bridge (`/api/telegram/membership`).
# Without it the bridge fails closed: the bot cannot confirm that somebody
# has paid, so it does not open the paid phases.
IMPERIUM_MEMBERSHIP_SECRET = os.getenv("IMPERIUM_MEMBERSHIP_SECRET") or ""

# The canonical membership link. The same URL the website uses, so the
# paywall in Telegram and the paywall on the site cannot disagree.
STRIPE_CHECKOUT_URL = os.getenv(
    "STRIPE_CHECKOUT_URL",
    "https://buy.stripe.com/4gM4gyfOs2V64an8Dd5AQ07",
)

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
    if not IMPERIUM_MEMBERSHIP_SECRET:
        logger.warning(
            "No IMPERIUM_MEMBERSHIP_SECRET configured. The membership bridge is off, "
            "so the bot cannot confirm that an account has paid and will not open the "
            "paid phases. Set it to the same value as the website's "
            "IMPERIUM_MEMBERSHIP_SECRET."
        )
