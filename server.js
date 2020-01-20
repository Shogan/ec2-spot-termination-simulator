const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello from the root.');
});

// Legacy spot termination-time endpoint
app.get('/latest/meta-data/spot/termination-time', (req, res) => {
  let date = new Date();
  let futureDate = new Date(date.getTime() + 2 * 60000);
  let logTimestamp = date.toISOString();
  let futureTimestamp = futureDate.toISOString();
  console.log(`${logTimestamp}: request received on path: '${req.path}' with user agent: '${req.get('User-Agent')}'. Requester IP: ${req.ip}, Client possible multiple IPs: ${req.ips}.`);
  res.send(futureTimestamp);
});

// Newer spot termination instance-action endpoint
app.get('/latest/meta-data/spot/instance-action', (req, res) => {
  let date = new Date();
  let futureDate = new Date(date.getTime() + 2 * 60000);
  let logTimestamp = date.toISOString();
  let futureTimestamp = futureDate.toISOString();
  console.log(`${logTimestamp}: request received on path: '${req.path}' with user agent: '${req.get('User-Agent')}'. Requester IP: ${req.ip}, Client possible multiple IPs: ${req.ips}.`);
  res.send({"action": "terminate", "time": futureTimestamp});
});

// Listen on the env var specified PORT or otherwise, choose TCP 8082.
const PORT = process.env.PORT || 8082;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});