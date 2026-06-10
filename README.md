# MimicMart - Robux Store with Telegram Notifications

A modern Robux selling platform with Ziina payment integration and Telegram bot notifications.

## Features

✅ Beautiful neon-themed UI
✅ Ziina secure payment gateway
✅ Telegram notifications for new orders
✅ Multi-currency support (USD/EUR)
✅ Mobile responsive design

## Installation

```bash
npm install
```

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will run on `http://localhost:3000`

## Configuration

Update `.env` with your values:
- `TELEGRAM_BOT_TOKEN` - Your Telegram bot token from @BotFather
- `TELEGRAM_CHAT_ID` - Your Telegram chat ID
- `PORT` - Server port (default: 3000)

## API Endpoints

### POST /webhook/payment
Receive order data and send Telegram notification

```json
{
  "orderData": {
    "username": "PlayerName",
    "items": [{"qty": 1, "robux": 3500}],
    "totalDisplay": "$40.00 USD",
    "contact": "phone or discord",
    "gamepass": "https://roblox.com/game-pass/123"
  }
}
```

### GET /health
Health check endpoint

### POST /test-notification
Send a test Telegram notification

## Deployment

Recommended platforms:
- Railway.app
- Render.com
- Heroku
- DigitalOcean
- AWS Lambda

## Frontend Integration

Update your `index.html` `confirmOrder()` function to call the webhook:

```javascript
fetch('YOUR_SERVER_URL/webhook/payment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ orderData: order })
}).then(() => {
  window.location.href = 'https://pay.ziina.com/...';
});
```
