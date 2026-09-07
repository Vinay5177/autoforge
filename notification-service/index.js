const express = require('express');
const app = express();
app.use(express.json());

let notifications = [];

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.post('/notify', (req, res) => {
  const { recipient, message, type } = req.body;
  const note = { id: notifications.length + 1, recipient, message, type: type || 'info', timestamp: new Date().toISOString() };
  notifications.push(note);
  console.log(`[NOTIFY] to=${recipient} :: ${message}`);
  res.status(201).json(note);
});

app.get('/notifications', (req, res) => res.json(notifications));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`notification-service listening on ${PORT}`));