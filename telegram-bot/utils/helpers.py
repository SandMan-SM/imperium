from telegram import InlineKeyboardButton, InlineKeyboardMarkup

def get_main_menu_keyboard():
    keyboard = [
        [InlineKeyboardButton("📚 Phases", callback_data="view_phases")],
        [InlineKeyboardButton("📊 My Progress", callback_data="view_progress")],
        [InlineKeyboardButton("▶️ Resume Course", callback_data="resume_course")]
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

def build_phase_keyboard(current_user_phase: int):
    from content.phases import PHASES
    keyboard = []
    
    for phase_id, phase_data in PHASES.items():
        if phase_id < current_user_phase:
            status = "✅"
            cb_data = f"phase_{phase_id}"
        elif phase_id == current_user_phase:
            status = "▶️"
            cb_data = f"phase_{phase_id}"
        else:
            status = "🔒"
            cb_data = "locked"
        
        btn_text = f"Phase {phase_id}: {phase_data['title']} {status}"
        keyboard.append([InlineKeyboardButton(btn_text, callback_data=cb_data)])
        
    keyboard.append([InlineKeyboardButton("🔙 Back to Main Menu", callback_data="main_menu")])
    return InlineKeyboardMarkup(keyboard)

def build_unit_keyboard(unit_id: int, is_completed_course: bool):
    keyboard = []
    if not is_completed_course:
        keyboard.append([InlineKeyboardButton("✅ Mark Complete & Next", callback_data=f"complete_unit_{unit_id}")])
    keyboard.append([InlineKeyboardButton("🔙 Back to Main Menu", callback_data="main_menu")])
    return InlineKeyboardMarkup(keyboard)
