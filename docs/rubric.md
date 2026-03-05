MASTER BUILD RUBRIC (NON-NEGOTIABLE)

This document defines the mandatory completion standards for the Imperium Telegram Bot project.

If ANY requirement in this rubric is not fully satisfied, the build is considered NOT DONE.

No partial compliance is acceptable.

SECTION 1 — OUTPUT FORMAT REQUIREMENTS

The agent MUST:

Output full file contents.

Output every file in its entirety.

Use this exact separator format:

===== FILE: path/to/filename.py =====

Never summarize code.

Never truncate code.

Never use placeholders such as:

“add your logic here”

“rest of code omitted”

“...”

Never output pseudo-code.

Never skip required files.

Never explain files unless explicitly asked.

Only output the files.

If any of these conditions are violated → NOT DONE.

SECTION 2 — REQUIRED PROJECT STRUCTURE

The final output MUST contain ALL of the following:

Imperium-main/
│
├── bot.py
├── config.py
├── database.py
├── requirements.txt
├── README.md
├── .env.example
│
├── handlers/
│   ├── start.py
│   ├── navigation.py
│   ├── progress.py
│
├── content/
│   └── phases.py
│
├── utils/
│   └── helpers.py

If ANY file is missing → NOT DONE.

SECTION 3 — CODE INTEGRITY REQUIREMENTS

The code MUST:

Run with Python 3.11+

Use python-telegram-bot (latest stable async version)

Be fully async-compatible

Contain zero undefined variables

Contain zero unresolved imports

Contain zero circular imports

Contain zero placeholder logic

Contain zero unused references

Contain proper exception handling

Contain logging configuration

Use environment variables for secrets

Contain no hardcoded tokens

If ANY error would occur on python bot.py → NOT DONE.

SECTION 4 — FUNCTIONAL REQUIREMENTS

The bot MUST:

User System

Auto-register users on /start

Store:

user_id

username

current_phase

current_unit

progress_percentage

join_date

completion_status

Persist data in SQLite

Resume progress correctly

Reset safely

Course Engine

Implement all 5 phases

Implement all 28 units

Load content dynamically from content/phases.py

Prevent skipping locked phases

Unlock units sequentially

Update progress on completion

Mark completion after unit 28

Navigation

Inline keyboards must work

Back button must function

/progress must display accurate percentage

/phases must display locked/unlocked correctly

No dead callback routes

If ANY logic path fails → NOT DONE.

SECTION 5 — SECURITY REQUIREMENTS

The bot MUST:

Restrict admin-only commands

Prevent SQL injection

Validate callback data

Handle invalid input safely

Never expose secrets in logs

If any vulnerability exists → NOT DONE.

SECTION 6 — DEPLOYMENT REQUIREMENTS

The project MUST include:

README.md containing:

Setup instructions

BotFather instructions

Environment variable setup

Local run instructions

Railway deployment steps

Render deployment steps

GitHub push steps

requirements.txt containing:

All required dependencies

No missing packages

.env.example containing:

TELEGRAM_BOT_TOKEN=

ADMIN_USER_ID=

DATABASE_URL= (if applicable)

If deployment cannot be completed in under 15 minutes → NOT DONE.

SECTION 7 — RUNTIME SIMULATION REQUIREMENT

Before final output, the agent MUST internally simulate:

User runs /start

User enters Phase 1

User completes Unit 1

User checks /progress

User resumes

User completes all 28 units

Bot restarts

User resumes again

If ANY failure would occur during this simulation → FIX BEFORE OUTPUT.

SECTION 8 — SELF-AUDIT REQUIREMENT

After generating files, the agent MUST:

Re-evaluate every requirement in this rubric.

Confirm compliance line by line.

If ANY requirement is not fully satisfied:

Regenerate the ENTIRE project.

Do not patch partial fixes.

Only output final files after all checks pass.

SECTION 9 — DEFINITION OF DONE

The project is DONE only when:

All required files exist.

Code runs without modification.

No runtime errors occur.

No import errors occur.

No missing handlers exist.

All 28 units load properly.

All navigation works.

All progress tracking persists.

Deployment instructions are complete.

Every rubric requirement is satisfied.

If ANY item above fails → NOT DONE.

FINAL RULE

Compliance is binary.

There is no partial completion.

If every requirement in this rubric is not fully satisfied:

THE BUILD IS NOT DONE.