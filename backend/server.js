const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

require('dotenv').config({ path: './.env' });

const app = express();
const port = process.env.PORT || 5000;
const mongourl = process.env.MONGODB_URI;

app.use(bodyParser.json());
app.use(helmet());
app.use(compression());

const allowedOrigins = [
  'http://localhost:3000',
  'https://navigeniusbeta-vercel.vercel.app',
];

// Configure CORS to allow requests from specified origins
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg =
        'The CORS policy for this site does not allow access from the specified origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

const loginActivitySchema = new mongoose.Schema({
  userId: String,
  device: String,
  location: String,
  date: String,
  time: String,
});

const LoginActivity = mongoose.model('LoginActivity', loginActivitySchema);

// API endpoint to get login activities
app.get('/api/login-activities', async (req, res) => {
  try {
    const userId = req.query.userId;
    const activities = await LoginActivity.find({ userId });
    console.log(`Fetched ${activities.length} activities for user ${userId}`);
    res.json(activities);
  } catch (error) {
    console.error('Error fetching login activities:', error);
    res.status(500).json({ error: 'Error fetching login activities' });
  }
});

// API endpoint to add login activity
app.post('/api/login-activities', async (req, res) => {
  const { userId, device, location, date, time } = req.body;

  if (!userId || !device || !location || !date || !time) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  try {
    const newActivity = new LoginActivity({
      userId,
      device,
      location,
      date,
      time,
    });
    await newActivity.save();
    console.log('New login activity recorded:', newActivity);
    res.status(201).json({ message: 'Login activity recorded' });
  } catch (error) {
    console.error('Error recording login activity:', error);
    res.status(500).json({ error: 'Error recording login activity' });
  }
});

// Connect to MongoDB
mongoose
  .connect(mongourl)
  .then(() => {
    console.log('Database is connected successfully.');

    // Serve the React app
    if (process.env.NODE_ENV === 'production') {
      app.use(express.static(path.join(__dirname, '../src/build')));

      app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../src/build', 'index.html'));
      });
    }

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => console.error('Database connection error:', error));

module.exports = app;
