from telegram import InlineKeyboardButton, InlineKeyboardMarkup

from config import STRIPE_CHECKOUT_URL

def get_main_menu_keyboard():
    keyboard = [
        [InlineKeyboardButton("Phases", callback_data="view_phases")],
        [InlineKeyboardButton("My Progress", callback_data="view_progress")],
        [InlineKeyboardButton("Resume Course", callback_data="resume_course")]
    ]
    return InlineKeyboardMarkup(keyboard)

def calculate_progress_percentage(current_unit: int, completed: bool):
    if completed:
        return 100
    # Current unit starts at 1. If currently on unit 1, progress implies 0 completed.
    # We'll consider progress = (current_unit - 1) / 28 * 100
    completed_units = current_unit - 1
    pct = int((completed_units / 28.0) * 100)
    return pct

def build_phase_keyboard(current_user_phase: int, member: bool = False, free_unit: int = 1):
    """
    Builds the phase list.

    A phase can be closed for two different reasons, and they are answered
    differently. A phase the reader has not reached yet is simply locked. A
    phase that is only open to members shows what it costs when it is
    pressed, because the reader can fix that one by joining.
    """
    from content.phases import PHASES
    keyboard = []

    for phase_id, phase_data in PHASES.items():
        units = phase_data["units"]
        membership_open = member or any(unit <= free_unit for unit in units)

        if not membership_open:
            status = "Locked"
            cb_data = f"phase_{phase_id}"
        elif phase_id < current_user_phase:
            status = "Done"
            cb_data = f"phase_{phase_id}"
        elif phase_id == current_user_phase:
            status = "Current"
            cb_data = f"phase_{phase_id}"
        else:
            status = "Locked"
            cb_data = "locked"

        btn_text = f"Phase {phase_id}: {phase_data['title']} — {status}"
        keyboard.append([InlineKeyboardButton(btn_text, callback_data=cb_data)])

    keyboard.append([InlineKeyboardButton("Back to Main Menu", callback_data="main_menu")])
    return InlineKeyboardMarkup(keyboard)

def build_unit_keyboard(unit_id: int, is_completed_course: bool):
    keyboard = []
    if not is_completed_course:
        keyboard.append([InlineKeyboardButton("Mark Complete & Next", callback_data=f"complete_unit_{unit_id}")])
    keyboard.append([InlineKeyboardButton("Back to Main Menu", callback_data="main_menu")])
    return InlineKeyboardMarkup(keyboard)

def build_membership_keyboard():
    """The paywall: the one link that takes a reader to the membership."""
    keyboard = [
        [InlineKeyboardButton("Join Imperium Elite — $20/month", url=STRIPE_CHECKOUT_URL)],
        [InlineKeyboardButton("Back to Main Menu", callback_data="main_menu")]
    ]
    return InlineKeyboardMarkup(keyboard)
