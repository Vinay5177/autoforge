const express = require('express');
const app = express();
app.use(express.json());

let customers = {
  "cust-1": { id: "cust-1", name: "Rahul Sharma", email: "rahul@example.com", phone: "9876543210",
    vehicles: [{ id: "veh-1", make: "Maruti", model: "Swift", year: 2020, plate: "KA01AB1234" }] },
  "cust-2": { id: "cust-2", name: "Priya Nair", email: "priya@example.com", phone: "9876500000",
    vehicles: [{ id: "veh-2", make: "Hyundai", model: "Creta", year: 2022, plate: "KA05CD5678" }] }
};

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.get('/customers/:id', (req, res) => {
  const c = customers[req.params.id];
  if (!c) return res.status(404).json({ error: 'customer not found' });
  res.json(c);
});

app.get('/customers/:id/vehicles/:vehicleId', (req, res) => {
  const c = customers[req.params.id];
  if (!c) return res.status(404).json({ error: 'customer not found' });
  const v = c.vehicles.find(v => v.id === req.params.vehicleId);
  if (!v) return res.status(404).json({ error: 'vehicle not found' });
  res.json(v);
});

app.post('/customers', (req, res) => {
  const id = `cust-${Object.keys(customers).length + 1}`;
  const customer = { id, ...req.body, vehicles: req.body.vehicles || [] };
  customers[id] = customer;
  res.status(201).json(customer);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`customer-service listening on ${PORT}`));