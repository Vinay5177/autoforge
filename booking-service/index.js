const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const CUSTOMER_URL = process.env.CUSTOMER_URL || 'http://customer-service:8080';
const JOB_URL = process.env.JOB_URL || 'http://job-service:8080';

let bookings = [];
let nextId = 1;

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.post('/bookings', async (req, res) => {
  const { customerId, vehicleId, serviceType, requestedDate } = req.body;
  try {
    // Validate customer + vehicle exist
    await axios.get(`${CUSTOMER_URL}/customers/${customerId}/vehicles/${vehicleId}`);

    const booking = { id: nextId++, customerId, vehicleId, serviceType, requestedDate, status: 'confirmed' };
    bookings.push(booking);

    // Open a job for this booking
    const job = await axios.post(`${JOB_URL}/jobs`, { bookingId: booking.id, customerId, vehicleId, serviceType });
    booking.jobId = job.data.id;

    res.status(201).json(booking);
  } catch (err) {
    if (err.response) return res.status(err.response.status).json(err.response.data);
    res.status(502).json({ error: 'downstream service unreachable' });
  }
});

app.get('/bookings', (req, res) => res.json(bookings));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`booking-service listening on ${PORT}`));