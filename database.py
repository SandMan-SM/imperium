import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

supabase = create_client(url, key)

async def register_user(telegram_id, username):
    data = {
        "telegram_id": telegram_id,
        "username": username,
        "current_phase": 1,
        "current_unit": 1,
        "completed_units": [],
        "oath_date": None
    }
    supabase.table('profiles').upsert(data).execute()

async def get_user(telegram_id):
    response = supabase.table('profiles').select("*").eq('telegram_id', telegram_id).execute()
    return response.data[0] if response.data else None

async def update_progress(telegram_id, completed_units, oath_date=None):
    data = {"completed_units": completed_units}
    if oath_date:
        data["oath_date"] = oath_date
    supabase.table('profiles').update(data).eq('telegram_id', telegram_id).execute()
