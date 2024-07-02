require('dotenv').config({ path: './.env.local' });
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const cron = require('node-cron');
const helmet = require('helmet');
const compression = require('compression');
const admin = require('firebase-admin');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 5001;
const DB_NAME = 'Navigenius';

app.use(express.json());
app.use(helmet());
app.use(compression());
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
// Allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://navigeniusbeta-vercel.vercel.app',
  'https://navigeniusbeta-vercel.onrender.com',
  'https://navigenius.live',
  'https://navigeniusbeta-vercel-production.up.railway.app',
];

// CORS options
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

let client;

// Memory usage logging
const logMemoryUsage = () => {
  const used = process.memoryUsage();
  console.log(
    `Memory usage: ${Math.round((used.heapUsed / 1024 / 1024) * 100) / 100} MB`,
  );
};

// Log memory usage every minute
setInterval(logMemoryUsage, 60000);

// Graceful shutdown on memory limit
process.on('memoryUsage', (info) => {
  console.warn('Memory usage near limit:', info);
  if (info.rss > 7.5 * 1024 * 1024 * 1024) {
    // 7.5GB
    console.error('Memory limit reached, shutting down');
    process.exit(1);
  }
});

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});
console.log('FIREBASE_SERVICE_ACCOUNT:', process.env.FIREBASE_SERVICE_ACCOUNT);

// Database connection
async function connectToDatabase() {
  try {
    client = await MongoClient.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
    return client.db(DB_NAME);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

// Delete old data (runs daily at midnight)
async function deleteOldData(db) {
  const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);

  try {
    await db
      .collection('emergencies')
      .deleteMany({ timestamp: { $lt: fifteenDaysAgo } });
    await db
      .collection('locations')
      .deleteMany({ timestamp: { $lt: fifteenDaysAgo } });
    console.log('Old data deleted successfully');
  } catch (error) {
    console.error('Error deleting old data:', error);
  }

  // Suggest garbage collection
  if (global.gc) {
    global.gc();
  }
}

// Reverse geocoding function
async function reverseGeocode(latitude, longitude) {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
    );
    return response.data.display_name;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return 'Address not available';
  }
}

// Listen to Firebase changes
async function listenToFirebaseChanges(db) {
  const firebaseDb = admin.database();
  const locationRef = firebaseDb.ref('Device/Locator');
  const emergencyRef = firebaseDb.ref('Device/Locator/emergency');

  locationRef.on('value', async (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const address = await reverseGeocode(data.Latitude, data.Longitude);
      const newLocation = {
        latitude: data.Latitude,
        longitude: data.Longitude,
        address: address,
        timestamp: new Date(data.timestamp || Date.now()),
      };
      await db.collection('locations').insertOne(newLocation);
      console.log('Location saved to MongoDB');
    }
  });

  emergencyRef.on('value', async (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const emergency = {
        emergency: data.emergency,
        timestamp: new Date(data.timestamp || Date.now()),
      };
      await db.collection('emergencies').insertOne(emergency);
      console.log('Emergency status saved to MongoDB');
    }
  });
}

// Routes
async function setupRoutes(db) {
  app.get('/api/getData', async (req, res) => {
    console.log('Received GET request to /api/getData');
    try {
      const latestEmergency = await db
        .collection('emergencies')
        .findOne({}, { sort: { timestamp: -1 } });

      const locationHistory = await db
        .collection('locations')
        .find()
        .sort({ timestamp: -1 })
        .limit(10)
        .toArray();

      const emergencyHistory = await db
        .collection('emergencies')
        .find()
        .sort({ timestamp: -1 })
        .toArray();

      res.status(200).json({
        latestEmergency,
        locationHistory,
        emergencyHistory,
      });
    } catch (error) {
      console.error('Error fetching data from MongoDB:', error);
      res.status(500).json({
        error: 'Error fetching data from the database',
        details: error.message,
      });
    }
  });

  app.post('/api/storeData', async (req, res) => {
    console.log('Received POST request to /api/storeData');
    console.log('Request body:', req.body);
    try {
      const { type, ...data } = req.body;
      data.timestamp = new Date(data.timestamp);

      if (type === 'emergency') {
        await db.collection('emergencies').insertOne(data);
      } else if (type === 'location') {
        await db.collection('locations').insertOne(data);
      } else {
        throw new Error('Invalid data type');
      }

      res.status(200).json({ message: 'Data stored successfully' });
    } catch (error) {
      console.error('Error storing data in MongoDB:', error);
      res.status(500).json({
        error: 'Error storing data in the database',
        details: error.message,
      });
    }
  });
}

// Create indexes for better query performance
async function createIndexes(db) {
  try {
    await db.collection('emergencies').createIndex({ timestamp: 1 });
    await db.collection('locations').createIndex({ timestamp: 1 });
    console.log('Indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
}

// Main function to start the server
async function startServer() {
  const db = await connectToDatabase();
  await createIndexes(db);
  await setupRoutes(db);
  await listenToFirebaseChanges(db);

  // Schedule the task to run at midnight every day
  cron.schedule('0 0 * * *', () => deleteOldData(db));

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer().catch(console.error);

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully');
  if (client) {
    await client.close();
  }
  process.exit(0);
});

module.exports = app;
