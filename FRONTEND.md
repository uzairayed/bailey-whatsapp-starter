# Frontend Documentation

The boilerplate includes two ready-to-use frontend pages: an **admin dashboard** and a **sample form**.

## Admin Dashboard

**URL**: `http://localhost:3001/admin.html`

A full-featured admin panel to manage your WhatsApp connection.

### Features

✅ **Connection Status** — View real-time WhatsApp status, phone number, session status  
✅ **QR Code Display** — Scan to authenticate (appears when disconnected)  
✅ **Send Messages** — Send messages to individual phone numbers  
✅ **Send to Groups** — Send messages to groups you're a member of  
✅ **Group Management** — List and select groups  
✅ **Admin Controls** — Reconnect, logout, refresh  

### Screenshots

**Connected State:**
- Shows: ✓ Connected, Phone number, Session status
- Displays: Send to phone, Send to group, Groups list
- Actions: Reconnect, Logout buttons

**Disconnected State:**
- Shows: ✗ Disconnected, No phone
- Displays: QR code scanner (auto-refresh)
- Actions: Scan with WhatsApp phone

### Usage

1. Open `http://localhost:3001/admin.html`
2. If asked for API_SECRET, enter it (or leave blank for development)
3. If disconnected, scan the QR code with WhatsApp
4. Once connected, send messages and manage groups

### No Database Required

Admin dashboard stores nothing on the server. It's purely UI + API calls.

---

## Sample Registration Form

**URL**: `http://localhost:3001/form.html`

A complete registration form that sends WhatsApp notifications.

### Form Fields

- **Name** — User's name
- **Phone Number** — Pakistan format (92XXXXXXXXXX)
- **Gender** — Male / Female
- **Role** — Driver / Passenger / Both
- **Pickup Location** — Where user is picked up
- **Office Location** — Destination
- **Preferred Times** — Optional pickup/drop times

### What Happens on Submit

1. User submits form
2. Form data sent to `/api/register` endpoint
3. WhatsApp message sent to user's phone
4. User receives: "Hi [Name]! Thanks for registering!"

### Customization

Edit `public/form.html` to:

**Change form fields:**
```html
<input type="email" name="email" required placeholder="email@example.com">
```

**Change submit endpoint:**
```javascript
const response = await fetch(`${API_URL}/api/register`, {
```

**Modify WhatsApp message:**
In `src/index.ts`, edit the registration route:
```typescript
const message = `Hi ${name}! Custom message here...`
```

---

## Using Frontend in Your App

### Option 1: Embed Forms in Your Website

Copy the form code and embed it in your Next.js/React app:

```jsx
// In your page
export default function SignupPage() {
  return (
    <div>
      <h1>Sign up</h1>
      <iframe src="http://localhost:3001/form.html" style={{ width: '100%', height: '800px', border: 'none' }} />
    </div>
  )
}
```

### Option 2: Build Your Own UI

Don't like the included UI? Build your own with React/Vue/Svelte:

```javascript
// Just call the API endpoints
const registerUser = async (data) => {
  const response = await fetch('http://localhost:3001/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return response.json()
}
```

### Option 3: Use as Admin Dashboard Only

If you only need the admin dashboard:
1. Keep `public/admin.html`
2. Delete `public/form.html`
3. Build your own form/API

---

## Frontend Stack

The included frontend uses:

- **HTML5** — Semantic markup
- **CSS3** — No frameworks, pure CSS
- **Vanilla JavaScript** — No dependencies
- **QR Code Library** — qrcode.js (loaded from CDN)

**Why minimal?**
- Fast (no build step)
- Easy to customize
- Works in any environment
- Easy to integrate with any framework

---

## Adding CORS Support

If frontend and backend are on different domains, add CORS:

**In `src/index.ts`:**

```typescript
import cors from "cors"

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}))
```

**Install cors:**
```bash
npm install cors
npm install --save-dev @types/cors
```

---

## Styling

### Change Colors

Edit `public/admin.html` or `public/form.html`:

```css
/* Find this */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Change to */
background: linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%);
```

### Use Your Brand Colors

```css
:root {
  --primary: #667eea;
  --secondary: #764ba2;
  --danger: #dc3545;
}

button {
  background: var(--primary);
}
```

---

## Deployment

### With Docker

Static files are automatically served when you run:

```bash
npm run build
docker build -t my-bot .
docker run -p 3001:3001 my-bot
```

Admin and form pages will be available at:
- `http://your-domain.com/admin.html`
- `http://your-domain.com/form.html`

### With Railway

Static files are served automatically. No extra config needed.

---

## Troubleshooting

### Form submits but message doesn't arrive

- Check: Is WhatsApp connected? (Admin dashboard shows "Connected")
- Check: Phone number format (92XXXXXXXXXX, not 03XX)
- Check: WhatsApp account isn't banned

### Admin dashboard shows "WhatsApp not connected"

- Scan the QR code with your WhatsApp phone
- Make sure WhatsApp on your phone is online
- Check service logs: `npm run dev`

### Can't access `/admin.html` or `/form.html`

- Check: Is server running? (`npm run dev`)
- Check: URL is correct (`http://localhost:3001/admin.html`)
- Check: `public/` folder exists with HTML files

---

## Next Steps

1. **Customize the form** — Change fields to match your needs
2. **Style to match your brand** — Edit CSS in HTML files
3. **Add more endpoints** — Create `public/chat.html` with messaging UI
4. **Integrate with backend** — Connect form to your database

See README.md and SETUP.md for backend docs.
