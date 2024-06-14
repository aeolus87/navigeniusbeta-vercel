const dotenv = require('dotenv');
dotenv.config({ path: './.env.local' });

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const port = process.env.REACT_APP_PORT || 5000;
const mongourl = process.env.REACT_APP_MONGO_URL;

app.use(bodyParser.json());

// Configure CORS
const allowedOrigins = ['https://navigeniusbeta-vercel.vercel.app'];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Check if the origin is allowed
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `This site ${origin} is not allowed to access this resource.`;
        return callback(new Error(msg), false);
      }

      // Allow the origin
      return callback(null, true);
    },
  }),
);

// Define a schema for login activities
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
    res.json(activities);
  } catch (error) {
    res.status(500).send('Error fetching login activitiesss');
  }
});

// API endpoint to add login activity
app.post('/api/login-activities', async (req, res) => {
  const { userId, device, location, date, time } = req.body;

  if (!userId || !device || !location || !date || !time) {
    return res.status(400).send('All fields are required');
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
    res.status(201).send('Login activity recorded');
  } catch (error) {
    res.status(500).send('Error recording login activity');
  }
});
// Connect to MongoDB
mongoose
  .connect(mongourl)
  .then(() => {
    console.log('Database is connected successfully.');
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  })
  .catch((error) => console.log(error));
