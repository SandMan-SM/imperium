import logging
import time

from telegram import Update
from telegram.ext import ContextTypes

import database
import membership
from config import STRIPE_CHECKOUT_URL

logger = logging.getLogger(__name__)

LINK_HELP = (
    "Send the access code from your Imperium account:\n\n"
    "/link <code>\n\n"
    "Open secretimperium.com while signed in, choose Connect Telegram, and copy "
    "the code it gives you. The code proves you are the member, so the bot can "
    "open every phase for you."
)

NOT_A_MEMBER = (
    "That code is good, but the membership behind it is not active.\n\n"
    "Join Imperium Elite here: {checkout}\n\n"
    "If you have just paid, give it a minute and run /link again with the same code."
)

CODE_NOT_VALID = (
    "That code is not valid, or it has expired.\n\n"
    "Open secretimperium.com while signed in, choose Connect Telegram, and "
    "send the new code."
)


async def connect_account(update: Update, code: str) -> bool:
    """
    Links this Telegram account to the membership a code points at.

    The code is exchanged with the website, which decides whether the address
    behind it still holds a paid membership. The bot is never told the
    address.

    Returns True when the account is now a member.
    """
    message = update.message
    if not message:
        return False

    user = update.effective_user
    result = membership.exchange_token(code, user.id, user.username)

    if not result.get("ok"):
        reason = str(result.get("error") or "The membership service could not be reached.")
        # The site says why it refused: a code it does not know, or one that
        # has expired. Anything else is a fault worth saying plainly.
        if result.get("status") in (404, 410):
            await message.reply_text(CODE_NOT_VALID)
        else:
            await message.reply_text(f"Could not confirm the membership: {reason}\n\nTry again in a moment.")
        return False

    if not result.get("premium"):
        await message.reply_text(NOT_A_MEMBER.format(checkout=STRIPE_CHECKOUT_URL))
        return False

    await database.set_membership(
        user.id,
        True,
        time.time(),
        int(result.get("freeUnit") or 1),
        int(result.get("unitCount") or 0),
    )

    await message.reply_text(
        "Connected. This account is now linked to your membership, and all five "
        "phases are open.\n\n"
        "Use /phases to see the sequence, and /resume to continue where you left off."
    )
    return True


async def link_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Links this Telegram account to a paid Imperium membership."""
    message = update.message
    if not message:
        return

    args = context.args or []
    if not args:
        await message.reply_text(LINK_HELP)
        return

    await connect_account(update, " ".join(args).strip())
