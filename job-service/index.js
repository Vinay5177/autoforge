const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const MECHANIC_URL = process.env.MECHANIC_URL || 'http://mechanic-service:8080';
const INVENTORY_URL = process.env.INVENTORY_URL || 'http://inventory-service:8080';
const NOTIFICATION_URL = process.env.NOTIFICATION_URL || 'http://notification-service:8080';

let jobs = [];
let nextId = 1;

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.post('/jobs', async (req, res) => {
  const { bookingId, customerId, vehicleId, serviceType } = req.body;
  const job = { id: nextId++, bookingId, customerId, vehicleId, serviceType, status: 'created', mechanicId: null, partsUsed: [] };
  jobs.push(job);

  // Fire-and-forget notification; don't block job creation on it
  axios.post(`${NOTIFICATION_URL}/notify`, {
    recipient: customerId, type: 'booking_confirmed',
    message: `Job #${job.id} created for ${serviceType}`
  }).catch(() => {});

  res.status(201).json(job);
});

app.post('/jobs/:id/assign-mechanic', async (req, res) => {
  const job = jobs.find(j => j.id === parseInt(req.params.id));
  if (!job) return res.status(404).json({ error: 'job not found' });
  try {
    const mech = await axios.post(`${MECHANIC_URL}/mechanics/assign`, { specialization: req.body.specialization });
    job.mechanicId = mech.data.id;
    job.status = 'in-progress';
    axios.post(`${NOTIFICATION_URL}/notify`, {
      recipient: job.customerId, type: 'status_update',
      message: `Job #${job.id} assigned to mechanic ${mech.data.name}`
    }).catch(() => {});
    res.json(job);
  } catch (err) {
    if (err.response) return res.status(err.response.status).json(err.response.data);
    res.status(502).json({ error: 'mechanic-service unreachable' });
  }
});

app.post('/jobs/:id/use-part', async (req, res) => {
  const job = jobs.find(j => j.id === parseInt(req.params.id));
  if (!job) return res.status(404).json({ error: 'job not found' });
  const { sku, qty } = req.body;
  try {
    const reserve = await axios.post(`${INVENTORY_URL}/parts/${sku}/reserve`, { qty });
    job.partsUsed.push({ sku, qty });
    res.json({ job, remainingStock: reserve.data.remaining });
  } catch (err) {
    if (err.response) return res.status(err.response.status).json(err.response.data);
    res.status(502).json({ error: 'inventory-service unreachable' });
  }
});

app.post('/jobs/:id/complete', async (req, res) => {
  const job = jobs.find(j => j.id === parseInt(req.params.id));
  if (!job) return res.status(404).json({ error: 'job not found' });
  job.status = 'completed';
  if (job.mechanicId) {
    axios.post(`${MECHANIC_URL}/mechanics/${job.mechanicId}/release`).catch(() => {});
  }
  axios.post(`${NOTIFICATION_URL}/notify`, {
    recipient: job.customerId, type: 'status_update',
    message: `Job #${job.id} completed`
  }).catch(() => {});
  res.json(job);
});

app.get('/jobs', (req, res) => res.json(jobs));
app.get('/jobs/:id', (req, res) => {
  const job = jobs.find(j => j.id === parseInt(req.params.id));
  if (!job) return res.status(404).json({ error: 'job not found' });
  res.json(job);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`job-service listening on ${PORT}`));