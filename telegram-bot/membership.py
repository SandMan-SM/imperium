"""Membership for the Imperium Telegram bot.

The bot used to keep its own `is_premium` flag in a local SQLite file. That
flag could never agree with Stripe: a member who paid on the website got
nothing in Telegram, and a cancelled subscription left the flag set forever.

The website is the system of record — it holds the Stripe ledger and the
Supabase rows — so the bot asks the website. One endpoint answers the
question:

    POST {IMPERIUM_SITE_URL}/api/telegram/membership
    x-imperium-secret: {IMPERIUM_MEMBERSHIP_SECRET}
    {"email": "...", "telegram_id": "...", "username": "..."}

The answer is cached locally for an hour so a normal conversation does not
call the site on every message, and a member whose subscription is cancelled
loses access within that hour.

Only the Python standard library is used, so the bot keeps its three
dependencies.
"""

import base64
import hashlib
import hmac
import json
import logging
import time
import urllib.error
import urllib.request
from typing import Any, Dict, Optional

from config import IMPERIUM_MEMBERSHIP_SECRET, IMPERIUM_SITE_URL

logger = logging.getLogger(__name__)

REQUEST_TIMEOUT = 10
CACHE_SECONDS = 3600

# The site decides how much of the curriculum is free; the bot asks it rather
# than keeping its own number. This is the fallback when the site cannot be
# reached — one unit, the same as the website's free sample.
DEFAULT_FREE_UNIT = 1

# How long a cached answer stays good before it is checked again.
_checked_at: Dict[int, float] = {}


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
        logger.warning("Membership bridge returned %s", error.code)
        return {"ok": False, "error": f"The membership service answered {error.code}."}
    except (urllib.error.URLError, TimeoutError) as error:
        logger.warning("Membership bridge could not be reached: %s", error)
        return {"ok": False, "error": "The membership service could not be reached."}
    except (ValueError, json.JSONDecodeError) as error:
        logger.warning("Membership bridge returned an unreadable answer: %s", error)
        return {"ok": False, "error": "The membership service returned an unreadable answer."}


def check_membership(email: str, telegram_id: Optional[int] = None, username: Optional[str] = None) -> Dict[str, Any]:
    """Asks the site whether an address holds a paid membership."""
    if not email:
        return {"ok": False, "error": "No address on file.", "premium": False}

    payload: Dict[str, Any] = {"email": email}
    if telegram_id is not None:
        payload["telegram_id"] = str(telegram_id)
    if username:
        payload["username"] = username

    return _post(payload)


def verify_link_code(code: str) -> Optional[str]:
    """
    Verifies an access code minted by the website.

    The code is `v1.<payload>.<signature>`:
      payload   - base64url JSON {"email": ..., "exp": ...}
      signature - base64url HMAC-SHA256 of the payload, keyed with the shared secret

    A code that is malformed, forged or expired returns None. This is what
    stops the email address from being the credential: the bot only learns
    an address the website has signed.
    """
    if not IMPERIUM_MEMBERSHIP_SECRET:
        return None

    parts = code.strip().split(".")
    if len(parts) != 3:
        return None

    version, payload, signature = parts
    if version != "v1":
        return None

    expected = base64.urlsafe_b64encode(
        hmac.new(
            IMPERIUM_MEMBERSHIP_SECRET.encode("utf-8"),
            payload.encode("utf-8"),
            hashlib.sha256,
        ).digest()
    ).decode("ascii").rstrip("=")

    if not hmac.compare_digest(signature, expected):
        return None

    try:
        padded = payload + "=" * (-len(payload) % 4)
        data = json.loads(base64.urlsafe_b64decode(padded).decode("utf-8"))
    except (ValueError, json.JSONDecodeError):
        return None

    email = data.get("email")
    expires_at = data.get("exp")

    if not isinstance(email, str) or "@" not in email:
        return None
    if not isinstance(expires_at, (int, float)) or expires_at * 1000 < time.time() * 1000:
        return None

    return email.lower()


def is_member(email: Optional[str], telegram_id: Optional[int] = None, username: Optional[str] = None) -> bool:
    """True when the address holds a paid membership."""
    if not email:
        return False

    result = check_membership(email, telegram_id, username)
    return bool(result.get("ok")) and bool(result.get("premium"))


def cache_is_fresh(telegram_id: int) -> bool:
    """True when the cached answer for this account is still good."""
    checked = _checked_at.get(telegram_id)
    return checked is not None and (time.time() - checked) < CACHE_SECONDS


def mark_checked(telegram_id: int) -> None:
    """Records that the membership was just checked."""
    _checked_at[telegram_id] = time.time()
