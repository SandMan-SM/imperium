"""Membership for the Imperium Telegram bot.

The bot used to keep its own `is_premium` flag in a local SQLite file. That
flag could never agree with Stripe: a member who paid on the website got
nothing in Telegram, and a cancelled subscription left the flag set forever.

The website is the system of record — it holds the Stripe ledger and the
Supabase rows — so the bot asks the website. One endpoint answers the
question:

    POST {IMPERIUM_SITE_URL}/api/telegram/membership
    x-imperium-secret: {IMPERIUM_MEMBERSHIP_SECRET}
    {"telegram_id": "...", "token": "..."}

The answer is cached locally for an hour so a normal conversation does not
call the site on every message, and a member whose subscription is cancelled
loses access within that hour.

The bot never learns the member's address. It either presents the code the
website gave the member, or asks about the Telegram account it was already
linked to, and the website answers yes or no.

Only the Python standard library is used, so the bot keeps its three
dependencies.
"""

import json
import logging
import urllib.error
import urllib.request
from typing import Any, Dict, Optional

from config import IMPERIUM_MEMBERSHIP_SECRET, IMPERIUM_SITE_URL

logger = logging.getLogger(__name__)

REQUEST_TIMEOUT = 10

# The site decides how much of the curriculum is free; the bot asks it rather
# than keeping its own number. This is the fallback when the site cannot be
# reached — one unit, the same as the website's free sample.
DEFAULT_FREE_UNIT = 1

# How long an answer stays good before it is checked again. The answer is
# kept in the bot's own database rather than in memory, so a restart does not
# send every member back to the site.
CACHE_SECONDS = 3600


def _post(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Calls the membership bridge and returns the decoded answer."""
    if not IMPERIUM_MEMBERSHIP_SECRET:
        return {"ok": False, "error": "The membership bridge is not configured on this bot."}

    body = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        f"{IMPERIUM_SITE_URL}/api/telegram/membership",
        data=body,
        headers={
            "Content-Type": "application/json",
            "x-imperium-secret": IMPERIUM_MEMBERSHIP_SECRET,
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=REQUEST_TIMEOUT) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        # The site explains itself — "that code is not valid", "that code has
        # expired" — so the reason is carried through rather than flattened
        # into a status code.
        message = f"The membership service answered {error.code}."
        try:
            body = json.loads(error.read().decode("utf-8"))
            if isinstance(body, dict) and isinstance(body.get("error"), str):
                message = body["error"]
        except (ValueError, json.JSONDecodeError, OSError):
            pass

        logger.warning("Membership bridge returned %s", error.code)
        return {"ok": False, "error": message, "status": error.code}
    except (urllib.error.URLError, TimeoutError) as error:
        logger.warning("Membership bridge could not be reached: %s", error)
        return {"ok": False, "error": "The membership service could not be reached."}
    except (ValueError, json.JSONDecodeError) as error:
        logger.warning("Membership bridge returned an unreadable answer: %s", error)
        return {"ok": False, "error": "The membership service returned an unreadable answer."}


def check_membership(telegram_id: int, username: Optional[str] = None) -> Dict[str, Any]:
    """Asks the site whether this Telegram account holds a paid membership."""
    if telegram_id is None:
        return {"ok": False, "error": "No Telegram account on file.", "premium": False}

    payload: Dict[str, Any] = {"telegram_id": str(telegram_id)}
    if username:
        payload["username"] = username

    return _post(payload)


def exchange_token(token: str, telegram_id: int, username: Optional[str] = None) -> Dict[str, Any]:
    """
    Links this Telegram account using a code the website issued.

    The code is the proof that the person holding this Telegram account is the
    member. The website spends it when it is presented, so a code cannot be
    used a second time.
    """
    if not token:
        return {"ok": False, "error": "No code was given.", "premium": False}

    payload: Dict[str, Any] = {"token": token.strip(), "telegram_id": str(telegram_id)}
    if username:
        payload["username"] = username

    return _post(payload)


def is_member(telegram_id: int, username: Optional[str] = None) -> bool:
    """True when this Telegram account holds a paid membership."""
    result = check_membership(telegram_id, username)
    return bool(result.get("ok")) and bool(result.get("premium"))
