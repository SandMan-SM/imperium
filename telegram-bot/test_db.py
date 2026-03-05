import asyncio
from database import init_db, register_user, get_user, update_user_progress, reset_user
import os

async def main():
    if os.path.exists("imperium.db"):
        os.remove("imperium.db")
        
    await init_db()
    
    # Test registration
    user_id = 999
    username = "test_user"
    await register_user(user_id, username)
    user = await get_user(user_id)
    assert user is not None
    assert user["username"] == "test_user"
    assert user["current_phase"] == 1
    assert user["current_unit"] == 1
    
    # Test update progress
    await update_user_progress(user_id, 2, 5, 20, completed=False)
    user = await get_user(user_id)
    assert user["current_phase"] == 2
    assert user["current_unit"] == 5
    assert user["progress_percentage"] == 20
    assert user["completion_status"] == 0
    
    # Test reset
    await reset_user(user_id)
    user = await get_user(user_id)
    assert user["current_phase"] == 1
    assert user["current_unit"] == 1
    
    # Clean up
    if os.path.exists("imperium.db"):
        os.remove("imperium.db")
        
    print("All database tests passed.")

if __name__ == "__main__":
    asyncio.run(main())
