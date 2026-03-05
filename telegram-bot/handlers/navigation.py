from telegram import Update
from telegram.ext import ContextTypes
import database
from content.phases import PHASES, TOTAL_UNITS
from utils.helpers import get_main_menu_keyboard, build_phase_keyboard, build_unit_keyboard, calculate_progress_percentage

async def handle_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    
    user_id = query.from_user.id
    data = query.data
    
    user = await database.get_user(user_id)
    if not user:
        await query.edit_message_text("User not found. Please type /start first.")
        return
        
    current_phase = user["current_phase"]
    current_unit = user["current_unit"]
    completion_status = user["completion_status"]
    
    if data == "main_menu":
        await query.edit_message_text("Main Menu:", reply_markup=get_main_menu_keyboard())
        
    elif data == "view_phases":
        keyboard = build_phase_keyboard(current_phase)
        await query.edit_message_text("Available Phases:", reply_markup=keyboard)
        
    elif data == "resume_course":
        if completion_status:
            await query.edit_message_text(
                "You have completed all 28 units of Imperium. Your legacy begins now.",
                reply_markup=get_main_menu_keyboard()
            )
            return
            
        phase_id = current_phase
        unit_id = current_unit
        
        phase_data = PHASES[phase_id]
        unit_data = phase_data["units"][unit_id]
        
        text = f"Phase {phase_id}: {phase_data['title']}\n\nUnit {unit_id}: {unit_data['title']}\n\n{unit_data['content']}"
        keyboard = build_unit_keyboard(unit_id, completion_status)
        await query.edit_message_text(text, reply_markup=keyboard)
        
    elif data.startswith("complete_unit_"):
        unit_id_str = data.split("_")[-1]
        try:
            completed_unit_id = int(unit_id_str)
        except ValueError:
            return
            
        if completed_unit_id != current_unit:
            await query.answer("You cannot complete this unit out of order.", show_alert=True)
            return
            
        if current_unit == TOTAL_UNITS:
            # Course complete
            await database.update_user_progress(user_id, current_phase, current_unit, 100, completed=True)
            await query.edit_message_text("Congratulations. You have completed all 28 principles of Imperium.", reply_markup=get_main_menu_keyboard())
            return
            
        # Move to next unit
        next_unit_id = current_unit + 1
        next_phase_id = current_phase
        
        # Determine next phase
        for pid, pdata in PHASES.items():
            if next_unit_id in pdata["units"]:
                next_phase_id = pid
                break
                
        pct = calculate_progress_percentage(next_unit_id, False)
        await database.update_user_progress(user_id, next_phase_id, next_unit_id, pct, completed=False)
        
        # Update current user variables
        current_phase = next_phase_id
        current_unit = next_unit_id
        
        phase_data = PHASES[current_phase]
        unit_data = phase_data["units"][current_unit]
        text = f"Phase {current_phase}: {phase_data['title']}\n\nUnit {current_unit}: {unit_data['title']}\n\n{unit_data['content']}"
        keyboard = build_unit_keyboard(current_unit, False)
        await query.edit_message_text(text, reply_markup=keyboard)
        
    elif data.startswith("phase_"):
        phase_str = data.split("_")[1]
        try:
            target_phase = int(phase_str)
        except ValueError:
            return
            
        if target_phase > current_phase:
            await query.answer("This phase is locked.", show_alert=True)
            return
            
        phase_data = PHASES[target_phase]
        text = f"Phase {target_phase}: {phase_data['title']}\n{phase_data['description']}"
        await query.edit_message_text(text, reply_markup=get_main_menu_keyboard())
        
    elif data == "locked":
        await query.answer("This phase is locked.", show_alert=True)
