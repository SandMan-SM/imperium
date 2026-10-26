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
   - `link` - Connect your Imperium membership

### 2. Environment Variable Setup
Copy the `.env.example` file to create your local `.env` file containing secrets.
```bash
cp .env.example .env
```
Open `.env` and paste in your tokens:
- `TELEGRAM_BOT_TOKEN=your-token-from-botfather`
- `ADMIN_USER_ID=your-personal-telegram-id`
- `IMPERIUM_MEMBERSHIP_SECRET=the-same-value-as-the-website`

### Membership — how the bot knows who has paid

The website is the system of record. It holds the Stripe ledger and the
Supabase rows, and the bot asks it rather than keeping a premium flag of its
own, which could never agree with Stripe.

Two endpoints carry the bridge:

- `GET /api/telegram/link-code` — mints a short access code for a signed-in
  member. The member sends the code to the bot with `/link`, or opens the
  deep link, which arrives as `/start <code>`.
- `POST /api/telegram/membership` — the bot's end of the bridge. It presents
  either the code (the first time) or the Telegram id it was linked to, and
  the website answers whether that account holds a paid membership.
  Authenticated with the `IMPERIUM_MEMBERSHIP_SECRET` shared secret.

The code is a random string rather than the member's address, so guessing an
address is not enough to read the paid sequence — and the bot never receives
the address at all. A code can be spent once, and it expires after seven days.

The code is also short and uses only the characters Telegram allows in a deep
link, so a member can be connected in one tap when the site knows the bot's
username (`TELEGRAM_BOT_USERNAME` on the website).

`IMPERIUM_MEMBERSHIP_SECRET` must be the same value on both sides. It is set
in Vercel for the website (Production and Preview). The local hand-off file
`telegram-bot/.membership-secret` holds the same value for copying into the
bot's own environment — it is gitignored.

Phases II to V are only open to a member. How many units are free is decided
by the website and read through the same bridge, so the bot and the site
cannot disagree.


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
