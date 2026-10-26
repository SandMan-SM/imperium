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
    "the code it gives you. The code proves the address you paid with, so the bot "
    "can open every phase for you."
)

NOT_A_MEMBER = (
    "That address does not have an active membership.\n\n"
    "Join Imperium Elite here: {checkout}\n\n"
    "If you have just paid, give it a minute and run /link again with the same code."
)


async def connect_account(update: Update, code: str) -> bool:
    """
    Links this Telegram account to the membership a code points at.

    Returns True when the account is now a member.
    """
    message = update.message
    if not message:
        return False

    email = membership.verify_link_code(code)

    if not email:
        await message.reply_text(
            "That code is not valid, or it has expired.\n\n"
            "Open secretimperium.com while signed in, choose Connect Telegram, and "
            "send the new code."
        )
        return False

    user = update.effective_user
    result = membership.check_membership(email, user.id, user.username)

    if not result.get("ok"):
        await message.reply_text(
            f"Could not confirm the membership: {result.get('error')}\n\n"
            "Try again in a moment."
        )
        return False

    if not result.get("premium"):
        await message.reply_text(NOT_A_MEMBER.format(checkout=STRIPE_CHECKOUT_URL))
        return False

    await database.set_membership(user.id, email, True, time.time())
    membership.mark_checked(user.id)

    await message.reply_text(
        f"Connected. {email} is now linked to this account, and all five phases are open.\n\n"
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
