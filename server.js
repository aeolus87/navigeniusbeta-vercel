const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors());

let loginActivities = [];

// API endpoint to get login activities
app.get('/api/login-activities', (req, res) => {
  res.json(loginActivities);
});

// API endpoint to add login activity
app.post('/api/login-activities', (req, res) => {
  const { device, location, date, time } = req.body;
  loginActivities.push({ device, location, date, time });
  res.status(201).send('Login activity recorded');
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
