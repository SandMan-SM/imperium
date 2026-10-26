"""Who may read which unit.

The bot used to hand the whole curriculum to anyone who pressed a button —
there was no premium flag at all, so the paid product was free in Telegram.

Two rules decide access:

  1. The website's free allowance — how many units anyone may read. The
     number comes from the site, so the bot and the site cannot disagree.
  2. Membership — a paying member reads every unit. Membership is confirmed
     by the site, which holds the Stripe ledger, and the answer is cached for
     an hour so a cancelled subscription is picked up within the hour.
"""

import logging
import time
from typing import Any, Dict, Optional

import database
import membership

logger = logging.getLogger(__name__)

# Used when the site cannot be reached: one free unit, the same as the
# website's free sample.
FALLBACK_FREE_UNIT = membership.DEFAULT_FREE_UNIT

MEMBERSHIP_HELP = (
    "Phases II to V are part of Imperium Elite.\n\n"
    "Join here: {checkout}\n\n"
    "Already a member? Send /link with the email address you paid with and "
    "the bot will open the sequence for you."
)


async def resolve_access(user: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Works out what this account may read.

    Returns:
        member      - whether the address holds a paid membership
        free_unit   - the number of units anyone may read
        unit_count  - the size of the curriculum
        error       - why membership could not be confirmed, if it could not
    """
    if not user:
        return {
            "member": False,
            "free_unit": FALLBACK_FREE_UNIT,
            "unit_count": 0,
            "error": None,
        }

    user_id = user.get("user_id")
    email = user.get("email")
    is_member = bool(user.get("is_member"))
    free_unit = FALLBACK_FREE_UNIT
    unit_count = 0
    error = None

    if membership.cache_is_fresh(user_id):
        # The answer is still good; use what is on file.
        return {
            "member": is_member,
            "free_unit": free_unit,
            "unit_count": unit_count,
            "error": None,
        }

    if not email:
        return {
            "member": False,
            "free_unit": free_unit,
            "unit_count": unit_count,
            "error": "no_address",
        }

    result = membership.check_membership(email, user_id, user.get("username"))

    if result.get("ok"):
        is_member = bool(result.get("premium"))
        free_unit = int(result.get("freeUnit") or FALLBACK_FREE_UNIT)
        unit_count = int(result.get("unitCount") or 0)
        membership.mark_checked(user_id)
        await database.set_membership(user_id, email, is_member, time.time())
    else:
        # The bridge could not answer. Keep whatever was on file rather than
        # locking a paying member out because the site was briefly down.
        error = result.get("error") or "unavailable"

    return {
        "member": is_member,
        "free_unit": free_unit,
        "unit_count": unit_count,
        "error": error,
    }


def can_read(access: Dict[str, Any], unit_number: int) -> bool:
    """True when this account may read the given unit."""
    if access.get("member"):
        return True
    return unit_number <= int(access.get("free_unit") or FALLBACK_FREE_UNIT)
