const express = require('express');
const app = express();
app.use(express.json());

let mechanics = {
  "mech-1": { id: "mech-1", name: "Arjun Kumar", specialization: "engine-tuning", available: true },
  "mech-2": { id: "mech-2", name: "Sneha Reddy", specialization: "bodywork", available: true },
  "mech-3": { id: "mech-3", name: "Vikram Singh", specialization: "electrical", available: false }
};

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.get('/mechanics', (req, res) => res.json(Object.values(mechanics)));

app.post('/mechanics/assign', (req, res) => {
  const { specialization } = req.body;
  const found = Object.values(mechanics).find(m => m.available && (!specialization || m.specialization === specialization));
  if (!found) return res.status(409).json({ error: 'no available mechanic' });
  found.available = false;
  res.json(found);
});

app.post('/mechanics/:id/release', (req, res) => {
  const m = mechanics[req.params.id];
  if (!m) return res.status(404).json({ error: 'mechanic not found' });
  m.available = true;
  res.json(m);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`mechanic-service listening on ${PORT}`));