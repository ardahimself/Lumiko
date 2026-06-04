# Security Documentation - Negi Discord Bot

## Overview
This document outlines the security measures implemented in the Negi Discord bot and provides guidelines for secure deployment.

## Security Measures Implemented

### 1. SQL Injection Protection
- **Status**: ✅ Implemented
- **Method**: All database queries use prepared statements with parameterized queries
- **Code**: Uses `better-sqlite3` with `?` placeholders
- **Example**:
  ```javascript
  db.prepare('SELECT * FROM users WHERE discord_id = ?').get(userId);
  ```
- **Dynamic SQL**: The `ORDER BY` clause in leaderboard uses whitelist validation

### 2. Input Validation
- **Status**: ✅ Implemented
- **Method**:
  - Discord.js slash commands automatically validate based on option types
  - Additional validation for payment amounts (must be > 0.01)
  - Screenshot uploads validated (max 10MB, must be image type)
  - Rating must be 1-5 (enforced by Discord.js + database CHECK constraint)

### 3. Permission Checks
- **Status**: ✅ Implemented for all admin/staff commands
- **Implementation**:
  ```javascript
  if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({
          content: '❌ You do not have permission.',
          ephemeral: true
      });
  }
  ```

### 4. Error Handling & Information Disclosure
- **Status**: ✅ Implemented
- **Measure**: All error messages are sanitized — raw errors are never exposed to users
- **Example**:
  ```javascript
  // Never: content: `❌ Error: ${result.error}`
  // Always: content: '❌ Failed to submit payment. Please try again.'
  ```

### 5. Rate Limiting
- **Status**: ✅ Implemented
- **Limits**:
  - Ticket creation: 3 per hour per user
  - Review submission: 24-hour cooldown
  - XP award: 60-second cooldown per user
- **Configurable** via `.env` (`MAX_TICKETS_PER_USER`, `TICKET_COOLDOWN_MINUTES`)

### 6. Blacklist System
- **Status**: ✅ Implemented
- **Features**:
  - Blacklist table with reason and evidence
  - Users table has `is_blacklisted` flag
  - Auto-flag for low trust scores (< 2.00)
  - Blacklist check on ticket creation

### 7. Environment Variable Security
- **Status**: ✅ Implemented
- **Measures**:
  - No hardcoded API keys in code (verified with automated tests)
  - All secrets stored in `.env` file
  - `.env` is in `.gitignore`
  - Error messages never expose environment variables

### 8. File Upload Security
- **Status**: ✅ Implemented
- **Payment Screenshot**:
  - Max file size: 10MB
  - Content type must start with `image/`
  - Processed server-side with OCR (Tesseract.js)

### 9. Trust System & Abuse Prevention
- **Status**: ✅ Implemented
- **Features**:
  - Trust score range: 0.00 – 10.00, bounds enforced at DB and application level
  - Automatic flagging for suspicious behavior
  - Self-review prevention
  - Underpayment detection for payments

### 10. API Security
- **Discord API**: Token stored in env, uses discord.js v14 (actively maintained)
- **OpenAI API**: Key stored in env, all calls over HTTPS with timeout

---

## Security Checklist for Deployment

### Pre-Deployment
- [ ] Set all values in `.env` (never commit this file)
- [ ] Use a unique, freshly generated Discord bot token
- [ ] Set `ENCRYPTION_KEY` to a secure random string
- [ ] Verify `.env` is in `.gitignore`
- [ ] Review admin role IDs
- [ ] Set proper Discord server permissions

### Runtime Security
- [ ] Run bot with limited user privileges (not root)
- [ ] Keep Node.js updated
- [ ] Monitor bot logs for suspicious activity
- [ ] Use PM2 or similar with restart limits

---

## Incident Response

### If Bot is Compromised
1. Immediately revoke Discord bot token and OpenAI API key
2. Check audit logs in Discord Developer Portal
3. Review bot's message history
4. Check server members for unauthorized changes
5. Redeploy with new credentials

### If User Reports Issue
1. Check bot logs: `pm2 logs` or systemd journal
2. Review recent tickets/payments in database
3. Check blacklist status of reporting user
4. Verify trust score integrity

---

## Security Testing

```bash
npm test
```

The test suite covers SQL injection protection, input validation, trust score bounds, blacklist functionality, payment security, and environment variable exposure.

---

## Updates
- **June 2026**: Full security audit completed — all checks passing
- Implemented: Prepared statements, permission checks, input validation, rate limiting, sanitized errors
- Fixed: Self-review bypass via mention format, SQL empty string literal crash
