# Quick Start (5 Minutes)

Get the Bailey WhatsApp service running in 5 minutes.

## Prerequisites

- Node.js 18+ (`node --version`)
- npm (`npm --version`)
- WhatsApp installed on your phone

## Step 1: Install Dependencies

```bash
npm install
```

Takes ~2 minutes. Installs express, bailey, pino, and TypeScript tools.

## Step 2: Create Environment File

```bash
cp .env.local.example .env.local
```

The default values work fine for local development:
- `PORT=3001`
- `API_SECRET=` (optional, leave empty for dev)
- `APP_NAME=MyWhatsAppBot`

## Step 3: Start the Service

```bash
npm run dev
```

You'll see:
```
Starting Bailey WhatsApp Service...

========================================
  Scan this QR code with WhatsApp:
========================================

████████████████████████████████████████
████ [QR CODE APPEARS HERE] ████████████
████████████████████████████████████████
```

## Step 4: Scan QR Code

1. Open WhatsApp on your phone
2. Go to **Settings → Linked Devices** (or **Settings → Connected Devices**)
3. Click **Link a Device**
4. Point camera at the QR code in your terminal

Wait for the message:
```
WhatsApp connection established successfully!
```

## Step 5: Access the Dashboard & Form

The service includes ready-to-use web pages. Open in your browser:

**Admin Dashboard** (manage connection, send messages)
```
http://localhost:3001/admin.html
```

**Sample Registration Form** (users submit data → they get WhatsApp invite)
```
http://localhost:3001/form.html
```

Success! 🎉

---

## Next: Send Your First Message

Still in the other terminal:

```bash
# Send a message to yourself
curl -X POST http://localhost:3001/messages/send \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "923001234567",
    "message": "Hello from Bailey!"
  }'
```

Replace `923001234567` with your actual phone number (Pakistan format: 92 + number without leading 0).

You should receive the message on WhatsApp! ✅

---

## Common Issues

### ❌ QR code doesn't appear

```bash
# Stop the service (Ctrl+C)
# Then delete auth files and restart
rm -rf auth_info/
npm run dev
```

### ❌ Port 3001 already in use

```bash
# Use a different port
PORT=3002 npm run dev
```

### ❌ "WhatsApp not connected" error

Make sure:
- Your phone's WhatsApp is open and connected to internet
- You successfully scanned the QR code
- The service shows `WhatsApp connection established successfully!`

---

## What to Do Next

### For Development

See **[README.md](./README.md)** for:
- Full API documentation
- All available endpoints
- Error handling details
- How to extend the service

### For Deployment

See **[SETUP.md](./SETUP.md)** for:
- Docker setup
- Railway deployment
- Render.com deployment
- Production security checklist

---

## API Endpoints (No Auth Required)

```
GET /health
```

Returns: `{ status: "ok", whatsapp: "connected", uptime: 123.45 }`

## API Endpoints (Auth Required)

First, set `API_SECRET` in `.env.local`:

```bash
# Generate a strong secret
openssl rand -hex 32

# Edit .env.local and set API_SECRET to the output
# API_SECRET=abc123...
```

Then use the secret in your requests:

```bash
# Get connection status + QR code
curl -H "Authorization: Bearer YOUR_SECRET" \
  http://localhost:3001/admin/status

# Send message to phone
curl -X POST http://localhost:3001/messages/send \
  -H "Authorization: Bearer YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"phone": "923001234567", "message": "Hi!"}'

# Send message to group
curl -X POST http://localhost:3001/messages/send-group \
  -H "Authorization: Bearer YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"groupId": "120363123456789-1234567890@g.us", "message": "Hello group!"}'

# List all groups
curl -H "Authorization: Bearer YOUR_SECRET" \
  http://localhost:3001/messages/fetch-groups
```

---

## Keyboard Shortcuts

- **Ctrl+C** — Stop the service
- **Ctrl+D** — Exit if stuck

---

## That's It!

You now have a working WhatsApp automation service. 🚀

- Use it to send notifications
- Build a chatbot
- Automate group messages
- Integrate with your backend

See README.md for examples on how to extend it.
