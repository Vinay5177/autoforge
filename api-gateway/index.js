const express = require('express');
const axios = require('axios');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());

const CUSTOMER_URL = process.env.CUSTOMER_URL || 'http://customer-service:8080';
const BOOKING_URL = process.env.BOOKING_URL || 'http://booking-service:8080';
const JOB_URL = process.env.JOB_URL || 'http://job-service:8080';
const MECHANIC_URL = process.env.MECHANIC_URL || 'http://mechanic-service:8080';
const INVENTORY_URL = process.env.INVENTORY_URL || 'http://inventory-service:8080';
const NOTIFICATION_URL = process.env.NOTIFICATION_URL || 'http://notification-service:8080';

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// Customers
app.get('/api/customers/:id', async (req, res) => {
  try {
    const r = await axios.get(`${CUSTOMER_URL}/customers/${req.params.id}`);
    res.json(r.data);
  } catch (err) {
    res.status(err.response?.status || 502).json(err.response?.data || { error: 'customer-service unreachable' });
  }
});
app.post('/api/customers', async (req, res) => {
  try {
    const r = await axios.post(`${CUSTOMER_URL}/customers`, req.body);
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 502).json(err.response?.data || { error: 'customer-service unreachable' });
  }
});

// Bookings
app.post('/api/bookings', async (req, res) => {
  try {
    const r = await axios.post(`${BOOKING_URL}/bookings`, req.body);
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 502).json(err.response?.data || { error: 'booking-service unreachable' });
  }
});

// Jobs
app.get('/api/jobs', async (req, res) => {
  const r = await axios.get(`${JOB_URL}/jobs`);
  res.json(r.data);
});
app.get('/api/jobs/:id', async (req, res) => {
  try {
    const r = await axios.get(`${JOB_URL}/jobs/${req.params.id}`);
    res.json(r.data);
  } catch (err) {
    res.status(err.response?.status || 502).json(err.response?.data || { error: 'job-service unreachable' });
  }
});
app.post('/api/jobs/:id/assign-mechanic', async (req, res) => {
  try {
    const r = await axios.post(`${JOB_URL}/jobs/${req.params.id}/assign-mechanic`, req.body);
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 502).json(err.response?.data || { error: 'job-service unreachable' });
  }
});
app.post('/api/jobs/:id/use-part', async (req, res) => {
  try {
    const r = await axios.post(`${JOB_URL}/jobs/${req.params.id}/use-part`, req.body);
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 502).json(err.response?.data || { error: 'job-service unreachable' });
  }
});
app.post('/api/jobs/:id/complete', async (req, res) => {
  try {
    const r = await axios.post(`${JOB_URL}/jobs/${req.params.id}/complete`);
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 502).json(err.response?.data || { error: 'job-service unreachable' });
  }
});

// Mechanics & Parts (read-only convenience routes)
app.get('/api/mechanics', async (req, res) => {
  const r = await axios.get(`${MECHANIC_URL}/mechanics`);
  res.json(r.data);
});
app.get('/api/parts/:sku', async (req, res) => {
  try {
    const r = await axios.get(`${INVENTORY_URL}/parts/${req.params.sku}`);
    res.json(r.data);
  } catch (err) {
    res.status(err.response?.status || 502).json(err.response?.data || { error: 'inventory-service unreachable' });
  }
});
app.get('/api/notifications', async (req, res) => {
  const r = await axios.get(`${NOTIFICATION_URL}/notifications`);
  res.json(r.data);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`api-gateway listening on ${PORT}`));