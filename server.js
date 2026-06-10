const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = '8615298444:AAE9Xe_wBZf1dLCmX7xW0NawRzqTg_2ml6c';
const TELEGRAM_CHAT_ID = '6003077289';
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

// Send Telegram Message
async function sendTelegramNotification(orderData) {
  const message = `
🎮 **NEW ORDER RECEIVED** 🎮

👤 **Customer:** ${orderData.username}
💎 **Robux:** ${orderData.items.map(i => `${i.qty}×${i.robux}`).join(' + ')}
💰 **Total:** ${orderData.totalDisplay}
💬 **Contact:** ${orderData.contact}
🔗 **Gamepass:** ${orderData.gamepass}
⏰ **Time:** ${new Date().toLocaleString('en-GB')}

✅ Payment Status: COMPLETED
🚀 Ready for delivery!
`;

  try {
    await axios.post(TELEGRAM_API, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    });
    console.log('✅ Telegram notification sent');
  } catch (error) {
    console.error('❌ Failed to send Telegram notification:', error.message);
  }
}

// Webhook endpoint for payment confirmation
app.post('/webhook/payment', async (req, res) => {
  try {
    const { orderData } = req.body;

    if (!orderData) {
      return res.status(400).json({ error: 'Missing order data' });
    }

    // Send Telegram notification
    await sendTelegramNotification(orderData);

    // Return success response
    res.json({ 
      success: true, 
      message: 'Order received and notification sent' 
    });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Test endpoint to send test notification
app.post('/test-notification', async (req, res) => {
  const testOrder = {
    username: 'TestUser123',
    items: [{ qty: 1, robux: 3500 }],
    totalDisplay: '$40.00 USD',
    contact: '+1234567890',
    gamepass: 'https://www.roblox.com/game-pass/12345'
  };

  await sendTelegramNotification(testOrder);
  res.json({ success: true, message: 'Test notification sent' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Telegram Bot Token: ${TELEGRAM_BOT_TOKEN.slice(0, 20)}...`);
  console.log(`👤 Chat ID: ${TELEGRAM_CHAT_ID}`);
});