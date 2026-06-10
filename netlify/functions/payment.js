const axios = require('axios');

const TELEGRAM_BOT_TOKEN = '8615298444:AAE9Xe_wBZf1dLCmX7xW0NawRzqTg_2ml6c';
const TELEGRAM_CHAT_ID = '6003077289';
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { orderData } = JSON.parse(event.body);

    if (!orderData) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing order data' })
      };
    }

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

    await axios.post(TELEGRAM_API, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Order received and Telegram notification sent'
      })
    };
  } catch (error) {
    console.error('Error:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Failed to process order',
        details: error.message
      })
    };
  }
};
