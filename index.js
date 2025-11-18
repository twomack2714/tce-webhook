require('dotenv').config();
const express = require('express');
const { Shopify } = require('@shopify/shopify-api');

const app = express();
app.use(express.raw({ type: 'application/json' }));

// === YOUR CE BACKEND URL (change this!) ===
const CE_BACKEND = "https://your-lovable-app.vercel.app/api/shopify-webhook";
// Example: https://collectorexpress.vercel.app/api/shopify-webhook

app.post('/webhook', async (req, res) => {
try {
const hmac = req.get('X-Shopify-Hmac-Sha256');
const body = req.body.toString();
const isValid = Shopify.Webhooks.validate(body, hmac, process.env.SHOPIFY_WEBHOOK_SECRET);

if (!isValid) {
console.log("Invalid webhook");
return res.status(401).send("Invalid");
}

const topic = req.get('X-Shopify-Topic');
const payload = JSON.parse(body);

if (topic === 'inventory_levels/update') {
const { inventory_item_id, available } = payload;
// Forward to your Lovable/Supabase backend
await fetch(CE_BACKEND, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ inventory_item_id, available })
});
}

res.status(200).send('OK');
} catch (e) {
console.error(e);
res.status(500).send('Error');
}
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Webhook live on ${port}`));
