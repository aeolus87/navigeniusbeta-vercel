require('dotenv').config({ path: './.env.backend' });

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const compression = require('compression');

const app = express();
const port = process.env.PORT || 5000;
const mongourl = process.env.MONGODB_URI;
console.log('MongoDB URI:', mongourl);
app.use(bodyParser.json());
app.use(helmet());
app.use(compression());

const allowedOrigins = [
  'http://localhost:3000',
  'https://navigeniusbeta-vercel.vercel.app',
];

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

mongoose
  .connect(mongourl)
  .then(() => {
    console.log('Database is connected successfully.');
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Database connection error:', error);
    app.listen(port, '0.0.0.0', () => {
      console.log(
        `Server running on port ${port} (without database connection)`,
      );
    });
  });
module.exports = app;
