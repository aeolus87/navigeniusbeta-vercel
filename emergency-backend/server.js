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
  const devicesRef = firebaseDb.ref('Devices');

  devicesRef.on('child_changed', async (snapshot) => {
    const deviceId = snapshot.key;
    const data = snapshot.val();

    if (data.Latitude && data.Longitude) {
      const address = await reverseGeocode(data.Latitude, data.Longitude);
      const newLocation = {
        deviceId,
        latitude: data.Latitude,
        longitude: data.Longitude,
        address: address,
        timestamp: new Date(data.timestamp || Date.now()),
      };
      await db.collection('locations').insertOne(newLocation);
      console.log('Location saved to MongoDB');
    }

    if (data.emergency !== undefined) {
      const emergency = {
        deviceId,
        emergency: data.emergency,
        timestamp: data.timestamp || new Date().toISOString(),
      };
      await db.collection('emergencies').insertOne(emergency);
      console.log('Emergency status saved to MongoDB');
    }
  });
}
// Routes
async function setupRoutes(db) {
  app.get('/api/getData/:userId', async (req, res) => {
    console.log('Received GET request to /api/getData');
    const { userId } = req.params;
    try {
      // Get the user's device ID from Firestore
      const userDoc = await admin
        .firestore()
        .collection('users')
        .doc(userId)
        .get();
      if (!userDoc.exists || !userDoc.data().device_id) {
        return res.status(403).json({ error: 'No device linked to this user' });
      }
      const deviceId = userDoc.data().device_id;

      const latestEmergency = await db
        .collection('emergencies')
        .findOne({ deviceId }, { sort: { timestamp: -1 } });

      const locationHistory = await db
        .collection('locations')
        .find({ deviceId })
        .sort({ timestamp: -1 })
        .limit(10)
        .toArray();

      const emergencyHistory = await db
        .collection('emergencies')
        .find({ deviceId })
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

  app.get('/api/checkDeviceLink/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
      const userDoc = await admin
        .firestore()
        .collection('users')
        .doc(userId)
        .get();
      const isLinked = userDoc.exists && userDoc.data().device_id;
      res.status(200).json({ isLinked: !!isLinked });
    } catch (error) {
      console.error('Error checking device link:', error);
      res
        .status(500)
        .json({ error: 'Error checking device link', details: error.message });
    }
  });

  app.post('/api/linkDevice', async (req, res) => {
    const { userId, deviceCode } = req.body;
    try {
      const deviceRef = admin.database().ref(`Devices/${deviceCode}`);
      const deviceSnapshot = await deviceRef.once('value');

      if (deviceSnapshot.exists()) {
        await admin
          .firestore()
          .collection('users')
          .doc(userId)
          .update({ device_id: deviceCode });
        await deviceRef.child('userId').set(userId);
        res.status(200).json({ message: 'Device linked successfully' });
      } else {
        res.status(400).json({ error: 'Invalid device code' });
      }
    } catch (error) {
      console.error('Error linking device:', error);
      res
        .status(500)
        .json({ error: 'Error linking device', details: error.message });
    }
  });

  app.post('/api/unlinkDevice', async (req, res) => {
    const { userId } = req.body;
    try {
      const userDoc = await admin
        .firestore()
        .collection('users')
        .doc(userId)
        .get();
      if (userDoc.exists && userDoc.data().device_id) {
        const deviceId = userDoc.data().device_id;
        await admin
          .firestore()
          .collection('users')
          .doc(userId)
          .update({ device_id: null });
        await admin.database().ref(`Devices/${deviceId}/userId`).remove();
        res.status(200).json({ message: 'Device unlinked successfully' });
      } else {
        res.status(400).json({ error: 'No device linked to this user' });
      }
    } catch (error) {
      console.error('Error unlinking device:', error);
      res
        .status(500)
        .json({ error: 'Error unlinking device', details: error.message });
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
