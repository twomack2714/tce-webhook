require('dotenv').config();
const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.raw({ type: 'application/json' })); // Important for Shopify

const SECRET = process.env.SHOPIFY_WEBHOOK_SECRET;

// Simple HMAC verification (no SDK needed)
function verifyShopifyWebhook(body, hmacHeader) {
  const hash = crypto
    .createHmac('sha256', SECRET)
    .update(body)
    .digest('base64');
  return hash === hmacHeader;
}

app.post('/webhook', (req, res) => {
  // Respond IMMEDIATELY so Shopify doesn't retry
  res.status(200).send('OK');

  const hmac = req.get('X-Shopify-Hmac-Sha256');
  const body = req.body.toString();

  if (!hmac || !verifyShopifyWebhook(body, hmac)) {
    console.log('Invalid HMAC - possible attack');
    return;
  }

  try {
    const payload = JSON.parse(body);
    console.log('Webhook received:', payload);

    // Forward to your Lovable app later – for now just log
    console.log('Stock updated →', payload.available, 'for item', payload.inventory_item_id);

    // TODO: Later send this to your Lovable/Supabase backend
    // fetch('https://your-app.vercel.app/api/shopify', { method: 'POST', body: JSON.stringify(payload) })

  } catch (e) {
    console.log('JSON parse error:', e.message);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Collector Express webhook LIVE at https://ce-webhook.onrender.com/webhook`);
});
