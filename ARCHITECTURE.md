# Negi Discord Bot - Architecture Design

## Bot Name: Negi

## Tech Stack
- **Runtime**: Node.js with discord.js v14+
- **Database**: SQLite (better-sqlite3) for simplicity, easy migration to PostgreSQL
- **AI Integration**: OpenAI API or local LLM for ticket auto-responses
- **OCR**: Tesseract.js for payment screenshot analysis
- **Caching**: node-cache for performance
- **Validation**: Joi for input validation

## Project Structure
```
negi-bot/
├── src/
│   ├── commands/           # Slash commands
│   │   ├── admin/         # Admin-only commands
│   │   ├── tickets/        # Ticket system commands
│   │   ├── payments/      # Payment/fee commands
│   │   └── stats/         # Stats/leaderboard commands
│   ├── events/            # Discord event handlers
│   │   ├── ticketEvents.js
│   │   ├── messageEvents.js
│   │   └── antiAbuse.js
│   ├── systems/           # Core systems
│   │   ├── TicketSystem.js
│   │   ├── PaymentTracker.js
│   │   ├── TrustSystem.js
│   │   ├── FeeCalculator.js
│   │   ├── StatsTracker.js
│   │   ├── AntiAbuse.js
│   │   └── AIHandler.js
│   ├── database/          # Database layer
│   │   ├── db.js
│   │   ├── migrations/
│   │   └── models/
│   ├── utils/             # Utilities
│   │   ├── ocr.js
│   │   ├── ai.js
│   │   ├── validators.js
│   │   └── helpers.js
│   └── config/
│       └── config.js
├── .env
├── config.json            # Bot configuration
├── index.js              # Main entry point
└── package.json
```

## Database Schema (SQLite)

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    discord_id TEXT UNIQUE NOT NULL,
    minecraft_ign TEXT,
    trust_score DECIMAL(3,2) DEFAULT 5.00,
    total_spent DECIMAL(10,2) DEFAULT 0,
    ticket_count INTEGER DEFAULT 0,
    is_blacklisted BOOLEAN DEFAULT 0,
    blacklist_reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Tickets Table
```sql
CREATE TABLE tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL,
    staff_id TEXT,
    category TEXT NOT NULL,
    subject TEXT,
    status TEXT DEFAULT 'open',
    priority TEXT DEFAULT 'normal',
    ai_response TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    closed_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(discord_id)
);
```

### Payments Table
```sql
CREATE TABLE payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payment_id TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    expected_amount DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    method TEXT,
    screenshot_url TEXT,
    ocr_verified BOOLEAN DEFAULT 0,
    underpay_detected BOOLEAN DEFAULT 0,
    status TEXT DEFAULT 'pending',
    verified_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(discord_id)
);
```

### Reviews Table
```sql
CREATE TABLE reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    staff_id TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    ticket_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(discord_id)
);
```

### Staff Stats Table
```sql
CREATE TABLE staff_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    staff_id TEXT UNIQUE NOT NULL,
    tickets_handled INTEGER DEFAULT 0,
    avg_response_time INTEGER,
    avg_rating DECIMAL(2,1),
    total_earned DECIMAL(10,2) DEFAULT 0,
    is_on_duty BOOLEAN DEFAULT 0,
    last_active DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES users(discord_id)
);
```

### Blacklist Table
```sql
CREATE TABLE blacklist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    discord_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    evidence TEXT,
    added_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Core Systems Design

### 1. Ticket System with AI Auto-Response
- Auto-create ticket channels in category
- AI analyzes initial message and provides instant response
- Categories: Payment Issue, Technical Support, Staff Application, Report User, Other
- Auto-assign priority based on keywords
- AI suggests solutions from knowledge base

### 2. Fee Calculator + Discounts
- Base fees for services
- Volume discounts (more spent = lower fees)
- Trust score discounts (higher trust = better rates)
- Special promotions/events
- Calculate: base_fee * (1 - trust_discount) * (1 - volume_discount)

### 3. Trust System
- Starting score: 5.00
- Increase: successful transactions (+0.1), positive reviews (+0.2)
- Decrease: cancelled orders (-0.3), negative reviews (-0.5), reports (-1.0)
- Thresholds: < 3.0 = suspicious, < 2.0 = auto-flag, < 1.0 = auto-blacklist consideration

### 4. Payment Tracking + OCR
- Users upload payment screenshots
- OCR extracts: amount, date, transaction ID
- Compare extracted amount vs expected
- Flag underpayments automatically
- Store verification status

### 5. Anti-Abuse System
- Rate limiting on ticket creation
- Detect spam keywords/patterns
- Blacklist checking on join/command
- Alt account detection (IP/hardware ID - if available)
- Scam pattern recognition in messages
- Auto-ban on severe violations

### 6. Staff Leaderboard
- Most tickets handled
- Highest average rating
- Fastest response time
- Most revenue generated
- Weekly/Monthly/All-time views

## AI Integration (Ticket Auto-Response)
- Use OpenAI GPT-4 or similar
- Train/fine-tune on DonutSMP-specific knowledge
- Fallback: predefined response templates
- Confidence threshold: only auto-respond if >80% confidence
- Always allow user to request human staff

## Commands Structure

### User Commands
- Ticket panel buttons - Create guided support tickets
- `/review` - Rate a user
- `/trust` - Check a user's trust score
- `/rank`, `/mystats`, `/leaderboard`, `/whoisthat`, `/trustinfo` - View stats and reputation
- `/spawnerprices` - Show spawner market prices

### Staff Commands
- `/ticket assign <ticket_id>` - Take ticket
- `/ticket resolve <ticket_id>` - Mark resolved
- `/payment verify <payment_id>` - Verify payment
- `/blacklist add <user> <reason>` - Blacklist user
- `/stats my` - Personal stats
- `/leaderboard view` - View leaderboard

### Admin Commands
- `/config set <key> <value>` - Change settings
- `/fees update <service> <amount>` - Update fee structure
- `/blacklist remove <user>` - Remove from blacklist
- `/ai toggle` - Enable/disable AI responses
- `/stats server` - Server-wide stats

## Environment Variables (.env)
```
DISCORD_TOKEN=your_bot_token
CLIENT_ID=your_application_id
GUILD_ID=your_server_id

# Database
DATABASE_PATH=./data/donutsmp.db

# AI
OPENAI_API_KEY=your_openai_key
AI_MODEL=gpt-4-turbo-preview

# OCR
OCR_LANGUAGE=eng

# Security
ENCRYPTION_KEY=your_encryption_key
MAX_TICKETS_PER_USER=5
TICKET_COOLDOWN_MINUTES=10

# Features
AI_AUTO_RESPONSE=true
PRIORITY_SUPPORT_ENABLED=true
UNDERPAY_THRESHOLD=0.95
```

## Implementation Priority
1. Database setup + migrations
2. Basic ticket system (create/close)
3. Fee calculator
4. Trust system basics
5. Payment tracking (without OCR first)
6. AI integration for tickets
7. OCR integration
8. Anti-abuse systems
9. Staff stats + leaderboard
10. Advanced features (priority support, etc.)
