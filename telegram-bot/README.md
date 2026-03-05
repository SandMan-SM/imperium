# Imperium Telegram Bot

This directory contains the production-ready code for the Imperium Telegram Bot, which delivers the 28 Principles of the Imperium Elite Mastermind directly to users.

## Setup Instructions

### 1. BotFather Instructions
To create your bot on Telegram:
1. Open Telegram and search for `@BotFather`.
2. Send `/newbot` and follow the prompts.
3. Choose a name (e.g., `Imperium Elite`) and a unique username ending in `bot`.
4. BotFather will provide a `TELEGRAM_BOT_TOKEN`. Keep this token secure.
5. (Optional) Set up the bot's commands via BotFather (`/setcommands`), adding:
   - `start` - Begin your journey
   - `progress` - Check your course progress
   - `phases` - View all phases

### 2. Environment Variable Setup
Copy the `.env.example` file to create your local `.env` file containing secrets.
```bash
cp .env.example .env
```
Open `.env` and paste in your tokens:
- `TELEGRAM_BOT_TOKEN=your-token-from-botfather`
- `ADMIN_USER_ID=your-personal-telegram-id`

### 3. Local Run Instructions
To run the bot locally on macOS / Linux / Windows:
1. Make sure you have Python 3.11+ installed.
2. Install the required dependencies using pip:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the application:
   ```bash
   python bot.py
   ```
4. The bot will create a local SQLite database named `imperium.db` automatically to track users and progress.

## Deployment Guidelines

### Railway Deployment Steps
1. Push this repository (`Imperium-main`) to a GitHub repository.
2. Sign up or log into [Railway.app](https://railway.app/).
3. Click "New Project" -> "Deploy from GitHub repo".
4. Select your repository.
5. Railway will automatically detect the Python environment via `requirements.txt`.
6. Go to "Variables" in your Railway project settings and add your `TELEGRAM_BOT_TOKEN`.
7. Railway uses Ephemeral filesystems by default, so if you're using SQLite, consider adding a volume map for `imperium.db` inside Railway to avoid data loss on restarts.

### Render Deployment Steps
1. Connect your GitHub repository to [Render.com](https://render.com/).
2. Create a "New Web Service" (or Background Worker) linked to the `Imperium-main` repo.
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `python bot.py`
5. Go to the "Environment" tab and set `TELEGRAM_BOT_TOKEN`.
6. Similar to Railway, since Render uses ephemeral disks, consider attaching a "Disk" mount in Render to the application directory to persist the SQLite `imperium.db`.

### GitHub Push Steps
Make sure not to commit your `.env` or `imperium.db` files.
```bash
git init
git add .
git commit -m "Init Imperium Telegram Bot"
git branch -M main
git remote add origin https://github.com/Username/Imperium-Repo.git
git push -u origin main
```
