const axios = require('axios');

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

✅ Payment Status: CONFIRMED ✓
🚀 Ready for delivery!
`;

  try {
    await axios.post(TELEGRAM_API, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    });
    console.log('✅ Telegram notification sent');
    return true;
  } catch (error) {
    console.error('❌ Failed to send Telegram notification:', error.message);
    return false;
  }
}

// Main handler - receives webhook from Ziina
exports.handler = async (event, context) => {
  console.log('📨 Request received:', event.httpMethod, event.path);

  // Handle POST requests from frontend (store order data temporarily)
  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body);
      
      // If it's an order submission (from checkout form)
      if (body.orderData && !body.status) {
        const { orderData } = body;

        if (!orderData) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing order data' })
          };
        }

        // Store order data temporarily (just log it for now)
        console.log('📝 Order received - awaiting payment:', orderData.username);

        return {
          statusCode: 200,
          body: JSON.stringify({
            success: true,
            message: 'Order received. Please complete payment on Ziina.'
          })
        };
      }

      // If it's a Ziina webhook callback (payment confirmation)
      if (body.status || body.reference) {
        console.log('💳 Ziina Webhook received');

        // Verify payment was successful
        const isSuccess = body.status === 'completed' || body.status === 'success' || body.paid === true;

        if (isSuccess) {
          // Payment confirmed! Extract order details
          const orderData = body.metadata || {
            username: body.customer_name || 'Customer',
            totalDisplay: `${body.amount} ${body.currency || 'USD'}`,
            contact: body.customer_contact || 'N/A',
            gamepass: 'See order reference',
            items: body.items || [{ qty: 1, robux: 0 }]
          };

          // Send Telegram notification ONLY after payment confirmed
          const notified = await sendTelegramNotification(orderData);

          return {
            statusCode: 200,
            body: JSON.stringify({
              success: true,
              message: 'Payment confirmed and customer notified',
              notified: notified
            })
          };
        } else {
          console.log('❌ Payment failed or pending. Status:', body.status);
          return {
            statusCode: 200,
            body: JSON.stringify({
              success: false,
              message: 'Payment not completed',
              status: body.status
            })
          };
        }
      }

      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid request' })
      };
    } catch (error) {
      console.error('Error:', error.message);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          success: false,
          error: 'Processing failed',
          details: error.message
        })
      };
    }
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};
