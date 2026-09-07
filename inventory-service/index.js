const express = require('express');
const app = express();
app.use(express.json());

let parts = {
  "turbo-kit": { sku: "turbo-kit", name: "Turbocharger Kit", quantity: 5, price: 45000 },
  "alloy-wheels": { sku: "alloy-wheels", name: "18-inch Alloy Wheels (set)", quantity: 10, price: 32000 },
  "exhaust-system": { sku: "exhaust-system", name: "Performance Exhaust", quantity: 8, price: 18000 }
};

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.get('/parts/:sku', (req, res) => {
  const p = parts[req.params.sku];
  if (!p) return res.status(404).json({ error: 'part not found' });
  res.json(p);
});

app.post('/parts/:sku/reserve', (req, res) => {
  const { qty } = req.body;
  const p = parts[req.params.sku];
  if (!p) return res.status(404).json({ error: 'part not found' });
  if (p.quantity < qty) return res.status(409).json({ error: 'insufficient stock' });
  p.quantity -= qty;
  res.json({ sku: p.sku, remaining: p.quantity });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`inventory-service listening on ${PORT}`));