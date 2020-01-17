const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello from the root.');
});

app.get('/latest/meta-data/spot/termination-time', (req, res) => {
  let epoch = Math.floor(new Date() / 1000);
  console.log(`${epoch}: request received on path: '${req.path}' with user agent: '${req.get('User-Agent')}'. Requester IP: ${req.ip}, Client possible multiple IPs: ${req.ips}.`);
  res.send('Surprise! This endpoint is now not returning 404 anymore... This will simulate an imminent (2 minute) spot termination.');
});

// Listen on the env var specified PORT or otherwise, choose TCP 8082.
const PORT = process.env.PORT || 8082;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});