# Hermes Poker Telegram Bot

Telegram bot that accepts poker table screenshots and returns a concise, practical recommendation.

## Where To Put The Bot Secret Key

Copy the template:

```bash
cd "/Users/janahasson/Desktop/Clients/Sitani Mafi/Imperium/poker-bot"
cp .env.template .env
```

Open `.env` and paste your secrets here:

```bash
TELEGRAM_BOT_TOKEN=123456789:AA...
OPENAI_API_KEY=sk-...
```

`TELEGRAM_BOT_TOKEN` comes from Telegram `@BotFather`. `OPENAI_API_KEY` is used for screenshot analysis.

## Run

```bash
cd "/Users/janahasson/Desktop/Clients/Sitani Mafi/Imperium/poker-bot"
./start.sh
```

The start script creates a Hermes session record at `run/hermes-session.json`, writes logs to `logs/hermes.log`, and keeps the bot running in the background.

Stop it with:

```bash
./stop.sh
```

## Use

1. Message the bot `/start`.
2. Send a poker screenshot as a photo.
3. Add optional caption context like: `9-handed, $1/$2, hero is BTN, no reads`.
4. Tap `Worked`, `Missed`, `Won`, or `Lost` after the hand so Hermes can adapt future advice.

The bot will return:
- perceived game state
- best action
- bet sizing when relevant
- why
- what it is uncertain about from the screenshot

## Learning Loop

Hermes stores advice and feedback locally in `hermes-poker.db`.

Commands:

```bash
/stats
/result HAND_ID won optional note
/result HAND_ID lost optional note
/result HAND_ID worked optional note
/result HAND_ID missed optional note
```

Future screenshots include the recent outcome memory as a weak exploitative prior. This improves adaptation to what works in your games without pretending to guarantee results.

This is decision support for lawful play and study, not a guarantee of outcome.
