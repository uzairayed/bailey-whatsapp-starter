# Bailey WhatsApp Service Boilerplate

A minimal, production-ready boilerplate for WhatsApp automation using [@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys).

**Zero business logic. Pure WhatsApp plumbing.**

## Features

- ✅ QR code authentication (no browser automation)
- ✅ Persistent session management (survives restarts)
- ✅ Send messages to individuals and groups
- ✅ List all groups the bot is member of
- ✅ Admin endpoints for reconnect/logout
- ✅ TypeScript, ESM-ready
- ✅ Docker-ready
- ✅ Production-grade error handling

## Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone or create from this boilerplate
git clone <repo-url> my-whatsapp-service
cd my-whatsapp-service

# Install dependencies
npm install

# Copy env file
cp .env.local.example .env.local
```

### Run Locally

```bash
# Development (with hot reload)
npm run dev

# Production
npm run build
npm start
```

Open http://localhost:3001/health to verify the service is running.

When QR code appears in terminal, scan with WhatsApp to authenticate.

## API Endpoints

### Health Check (Public)

```
GET /health
```

Response:
```json
{
  "status": "ok",
  "whatsapp": "connected",
  "uptime": 123.456
}
```

### Admin Routes (Protected)

#### Get Status

```
GET /admin/status
Authorization: Bearer YOUR_API_SECRET
```

Response:
```json
{
  "state": "connected",
  "connected": true,
  "hasQR": false,
  "phone": "923001234567",
  "hasSession": true,
  "qr": null
}
```

#### Reconnect

```
POST /admin/reconnect
Authorization: Bearer YOUR_API_SECRET
```

Re-initializes the WhatsApp connection (useful if disconnected).

#### Logout

```
POST /admin/logout
Authorization: Bearer YOUR_API_SECRET
```

Clears session and generates a fresh QR code on next start.

### Messaging Routes (Protected)

#### Send Message to Number

```
POST /messages/send
Authorization: Bearer YOUR_API_SECRET
Content-Type: application/json

{
  "phone": "923001234567",
  "message": "Hello from Bailey!"
}
```

Phone number can be in any format; dashes/spaces are stripped.

#### Send Message to Group

```
POST /messages/send-group
Authorization: Bearer YOUR_API_SECRET
Content-Type: application/json

{
  "groupId": "120363123456789-1234567890@g.us",
  "message": "Hello group!"
}
```

Group ID format: `[numbers]-[numbers]@g.us` (found via `/messages/fetch-groups`)

#### Fetch Groups

```
GET /messages/fetch-groups
Authorization: Bearer YOUR_API_SECRET
```

Lists all groups the bot is a member of.

## Configuration

### Environment Variables

```bash
PORT=3001                              # Service port
API_SECRET=your-secret-key             # Bearer token for protected routes
APP_NAME=MyWhatsAppBot                 # Device name in WhatsApp
```

### Security

- **API_SECRET**: If not set, routes are public (good for development, bad for production)
- All routes use Bearer token authentication
- No credentials stored in code or git

## Project Structure

```
bailey-starter/
├── src/
│   ├── baileys.ts          # Core Bailey socket setup
│   ├── index.ts            # Express server
│   └── routes/
│       ├── admin.ts        # Admin endpoints
│       └── messages.ts     # Message sending endpoints
├── package.json
├── tsconfig.json
├── .env.local.example
└── README.md
```

## Authentication Flow

1. **First Run**: Service generates QR code in terminal
2. **Scan QR**: User scans with WhatsApp on phone
3. **Connected**: Credentials saved to `auth_info/` directory
4. **Restart**: Service auto-reconnects using saved credentials
5. **Logout**: Delete credentials to force fresh QR on next start

## Error Handling

| Scenario | Behavior |
|----------|----------|
| WhatsApp server down | Auto-reconnect every ~30s |
| Invalid group/phone | API returns 500 with error message |
| API_SECRET missing | Requests fail with 401 |
| Port already in use | Process exits with error |

## Deployment

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --production
COPY dist ./dist
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

### Railway / Render / Fly.io

1. Set environment variables (PORT, API_SECRET, APP_NAME)
2. Mount volume at `./auth_info/` to persist credentials across restarts
3. Deploy from git

### Vercel (Not Recommended)

Bailey requires a persistent long-running process. Vercel functions are serverless and not suitable. Use Railway, Render, or Fly instead.

## Extending the Boilerplate

### Add New Message Types

Edit `src/routes/messages.ts`:

```typescript
// Send media message
router.post("/send-media", async (req: Request, res: Response) => {
  const { phone, mediaUrl, caption } = req.body
  const sock = getSocket()
  // ... use sock.sendMessage() with media: { url: ... }
})
```

### Add Webhook Support

```typescript
// Receive incoming messages
sock.ev.on("messages.upsert", (m) => {
  const message = m.messages[0]
  // POST to your webhook
  fetch(process.env.WEBHOOK_URL, {
    method: "POST",
    body: JSON.stringify(message),
  })
})
```

### Add Group Management

```typescript
// Create new group
sock.groupCreate("Group Name", ["923001234567@s.whatsapp.net"])

// Add member to group
sock.groupParticipantsUpdate(groupId, ["923001234567@s.whatsapp.net"], "add")
```

## Troubleshooting

### QR Code doesn't appear

- Check that `printQRInTerminal: false` is set in `baileys.ts`
- Clear `auth_info/` directory and restart
- Check service logs: `npm run dev`

### "WhatsApp not connected" error

- Scan fresh QR code: delete `auth_info/` and restart
- Check WhatsApp phone is online
- Check network connectivity

### Message send fails

- Verify phone/group ID format
- Check WhatsApp account status (not banned/restricted)
- Ensure API_SECRET is correct

## License

MIT

## Resources

- [Baileys GitHub](https://github.com/WhiskeySockets/Baileys)
- [WhatsApp JID Format](https://github.com/WhiskeySockets/Baileys/wiki)
- [Express.js Docs](https://expressjs.com/)
