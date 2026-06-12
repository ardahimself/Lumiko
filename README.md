# Lumiko Discord Bot

Lumiko is a comprehensive Discord bot for DonutSMP sub-servers with advanced features including ticket system, payment tracking, trust system, XP/leveling, giveaways, and AI-powered support.

## Features

- **Full Ticket System** — Complete ticket lifecycle with 10 categories, modal-based creation, priorities, staff assignment, and HTML transcripts
- **Trust & Review System** — User rating system (1–5 stars) with anonymous reviews, trust score tracking, and priority role assignment
- **XP & Leveling** — Message-based XP with configurable channels, level-up announcements, and rank cards
- **Giveaway System** — Quick/Daily/Weekly/Custom giveaways with button entry, reroll support, and DM notifications
- **Moderation Logging** — Message delete/edit, member join/leave/kick, ban/unban logging
- **Anti-Raid Protection** — Spam detection, join flood protection, automatic actions
- **Fee Calculator + Discounts** — Dynamic pricing based on trust score and volume
- **Payment Tracking** — OCR screenshot verification, underpayment detection
- **Stats & Leaderboard** — Comprehensive stats for users and staff
- **Server Stats Channels** — Auto-updating voice channels for member counts

## Prerequisites

- Node.js 18+
- Discord Bot Token ([Create here](https://discord.com/developers/applications))
- OpenAI API Key (for AI auto-responses, optional)

## Installation

1. Clone or navigate to the project directory:
   ```bash
   cd path/to/lumiko-bot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Windows PowerShell: Copy-Item .env.example .env
   # Edit .env with your preferred editor
   ```

4. Set up Discord Bot:
   - Go to https://discord.com/developers/applications
   - Create New Application → Bot section
   - Enable **MESSAGE CONTENT INTENT** under Privileged Gateway Intents
   - Copy the token → add to `.env` as `DISCORD_TOKEN`
   - Copy Client ID → add to `.env` as `CLIENT_ID`

5. Deploy slash commands:
   ```bash
   npm run deploy
   ```

6. Start the bot:
   ```bash
   npm start
   ```

## Configuration

### Required Environment Variables

| Variable | Description |
|----------|-------------|
| `DISCORD_TOKEN` | Your Discord bot token |
| `CLIENT_ID` | Your application's client ID |

### Optional Configuration

| Variable | Description |
|----------|-------------|
| `GUILD_ID` | Guild-specific command deployment (faster testing) |
| `OPENAI_API_KEY` | Enable AI auto-responses |
| `STAFF_TICKET_CHANNEL` | Channel ID for staff notifications |
| `STAFF_ROLE_ID` | Role ID for staff permissions |

## Database

Uses SQLite (better-sqlite3). Database is created automatically at `./data/donutsmp.db`.

All tables and migrations are applied on first run.

## Commands

### User Commands
- `/spawnerprices` — Show current spawner market prices
- `/review @user [1-5] [comment]` — Rate a user (anonymous option)
- `/trust @user` — Check a user's trust score
- `/whoisthat @user` — View all reviews for a user
- `/rank [user]` — View rank card
- `/mystats` — Personal statistics
- `/leaderboard` — Trust + XP leaderboards
- `/trustinfo` — Trust system info
- `/giveaway list` — List active giveaways

### Staff Commands
- `/close` — Select & close ticket with transcript
- `/add-to-ticket @user` — Add user to ticket thread

### Admin Commands
- `/panel [channel]` — Create ticket panel
- `/reviewpanel [channel]` — Create review panel
- `/config welcome-channel/mod-log/transcript-channel` — Configure channels
- `/spawnerprices-update` — Update prices via JSON editor
- `/stats-channel [type] [#channel]` — Auto-update voice channel name
- `/xp-config` — Configure XP settings
- `/giveaway start/end/reroll` — Manage giveaways
- `/antiraid` — Toggle anti-raid system
- `/clearchat` — Clear messages

## Project Structure

```
lumiko-bot/
├── src/
│   ├── commands/          # Slash commands organized by category
│   │   ├── admin/
│   │   ├── tickets/
│   │   └── stats/
│   ├── systems/           # Core business logic
│   ├── database/          # Database layer & migrations
│   └── utils/             # Utility functions
├── config/                # JSON config files
├── index.js               # Main entry point
├── deploy-commands.js     # Slash command deployer
└── ARCHITECTURE.md        # Detailed architecture documentation
```

## Testing

```bash
npm test
```

219 tests — 0 failures.

## License

© 2026 ardaarch. All rights reserved.
Source code is made available for viewing purposes only.
You may not use, copy, modify, or deploy this software without explicit permission.
