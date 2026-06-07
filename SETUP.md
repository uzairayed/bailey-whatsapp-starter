# Setup Guide

## For Beginners

### 1. Clone or Fork

```bash
# From GitHub
git clone https://github.com/yourusername/bailey-whatsapp-starter.git
cd bailey-whatsapp-starter
```

Or use as a template: Click "Use this template" on GitHub.

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
- `PORT`: Keep as 3001 (or change if in use)
- `API_SECRET`: Set a strong secret (e.g., `openssl rand -hex 32`)
- `APP_NAME`: Your app's name (e.g., "My Bot")

### 4. Run Locally

```bash
npm run dev
```

You'll see a QR code in the terminal. **Scan it with WhatsApp on your phone.**

After scanning, you should see:
```
WhatsApp connection established successfully!
```

### 5. Test the Service

**In another terminal:**

```bash
# Check health
curl http://localhost:3001/health

# Get status (replace YOUR_SECRET with actual secret)
curl -H "Authorization: Bearer YOUR_SECRET" \
  http://localhost:3001/admin/status

# Send a test message
curl -X POST http://localhost:3001/messages/send \
  -H "Authorization: Bearer YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"phone": "923001234567", "message": "Hello!"}'
```

## For Production

### Option 1: Docker

```bash
# Build
docker build -t my-whatsapp-bot .

# Run
docker run -d \
  --name whatsapp-bot \
  -p 3001:3001 \
  -e API_SECRET="your-secret" \
  -e APP_NAME="MyBot" \
  -v whatsapp-auth:/app/auth_info \
  my-whatsapp-bot
```

### Option 2: Railway.app

1. Push to GitHub
2. Go to [railway.app](https://railway.app)
3. Create new project → Import from GitHub
4. Add these variables:
   - `PORT`: 3001
   - `API_SECRET`: (strong secret)
   - `APP_NAME`: (your name)
5. Deploy

#### Add Volume for Persistent Auth

1. In Railway project settings → Volumes
2. Add volume: Mount path `/app/auth_info`
3. Deploy again

### Option 3: Render.com

1. Connect GitHub repo
2. Create new Web Service
3. Build command: `npm install && npm run build`
4. Start command: `node dist/index.js`
5. Add environment variables (same as above)
6. Deploy

#### Persistent Storage for Auth

1. Go to Disks tab
2. Add disk: Mount path `/app/auth_info`
3. Redeploy

## Security Checklist

- [ ] Set strong `API_SECRET` (32+ characters)
- [ ] Never commit `.env.local` to git
- [ ] Use HTTPS in production
- [ ] Rate limit API endpoints if exposed publicly
- [ ] Monitor WhatsApp account for suspicious activity
- [ ] Keep dependencies updated (`npm audit`, `npm update`)

## Common Issues

### Service won't start

```bash
# Check port is free
lsof -i :3001

# Or use different port
PORT=3002 npm run dev
```

### QR code doesn't appear

```bash
# Delete auth files and restart
rm -rf auth_info/
npm run dev
```

### "WhatsApp not connected" when sending message

- Ensure your phone's WhatsApp is active
- Check phone has internet
- Rescan QR code: logout and connect again

## Next Steps

1. **Integrate with your app**: Call `/messages/send` from your backend
2. **Add webhooks**: Listen to incoming messages (see README)
3. **Deploy**: Move to production environment
4. **Monitor**: Log usage, track errors

## Getting Help

- Check README.md for API docs
- Read src/ files (well-commented)
- Visit [Baileys GitHub](https://github.com/WhiskeySockets/Baileys)
- Check Baileys wiki for advanced features
