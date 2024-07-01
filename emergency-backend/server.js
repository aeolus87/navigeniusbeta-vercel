const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const admin = require('firebase-admin');

const app = express();
const port = process.env.PORT || 5001;
const DB_NAME = 'Navigenius';

app.use(express.json());
app.use(helmet());
app.use(compression());

const allowedOrigins = [
  'http://localhost:3000',
  'https://navigeniusbeta-vercel.vercel.app',
  'https://navigeniusbeta-vercel.onrender.com',
  'https://navigenius.live',
  'https://navigeniusbeta-vercel-production.up.railway.app',
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

let client;

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

// Connect to MongoDB
async function connectToDatabase() {
  try {
    client = await MongoClient.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB:', client.s.url);

    client.on('close', () => console.log('MongoDB connection closed'));
    client.on('reconnect', () => console.log('MongoDB reconnected'));
    client.on('error', (err) =>
      console.error('MongoDB connection error:', err),
    );

    return client.db(DB_NAME);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

// Delete old data from MongoDB
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

  if (global.gc) {
    global.gc();
  }
}

// Setup Firebase listeners for real-time updates
function setupFirebaseListeners(db) {
  const firebaseDb = admin.database();
  let locationRef = firebaseDb.ref('Device/Locator');
  let emergencyRef = firebaseDb.ref('Device/Locator/emergency');

  function setupListeners() {
    locationRef.on('value', async (snapshot) => {
      const data = snapshot.val();
      if (data && data.Latitude && data.Longitude) {
        const newLocation = {
          latitude: data.Latitude,
          longitude: data.Longitude,
          timestamp: new Date(),
        };
        try {
          await db.collection('locations').insertOne(newLocation);
          console.log('New location saved to MongoDB');
        } catch (error) {
          console.error('Error saving location to MongoDB:', error);
        }
      }
    });

    emergencyRef.on('value', async (snapshot) => {
      const data = snapshot.val();
      if (data && data.emergency !== undefined) {
        const newEmergency = {
          emergency: data.emergency,
          timestamp: new Date(),
        };
        try {
          await db.collection('emergencies').insertOne(newEmergency);
          console.log('New emergency status saved');
        } catch (error) {
          console.error('Error saving emergency status:', error);
        }
      }
    });
  }

  setupListeners();

  // Reinitialize Firebase connection every 5 minutes
  setInterval(
    () => {
      console.log('Reinitializing Firebase connection');
      locationRef.off();
      emergencyRef.off();
      admin
        .app()
        .delete()
        .then(() => {
          admin.initializeApp({
            credential: admin.credential.cert({
              projectId: process.env.FIREBASE_PROJECT_ID,
              privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(
                /\\n/g,
                '\n',
              ),
              clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            }),
            databaseURL: process.env.FIREBASE_DATABASE_URL,
          });
          firebaseDb = admin.database();
          locationRef = firebaseDb.ref('Device/Locator');
          emergencyRef = firebaseDb.ref('Device/Locator/emergency');
          setupListeners();
        });
    },
    5 * 60 * 1000,
  );

  // Send a keep-alive signal every minute
  setInterval(() => {
    firebaseDb.goOnline();
    console.log('Sent keep-alive signal to Firebase');
  }, 60 * 1000);

  const connectedRef = firebaseDb.ref('.info/connected');
  connectedRef.on('value', (snap) => {
    if (snap.val() === true) {
      console.log('Connected to Firebase');
    } else {
      console.log('Disconnected from Firebase, attempting to reconnect');
      firebaseDb.goOnline();
    }
  });
}

// Create necessary indexes in MongoDB
async function createIndexes(db) {
  try {
    await db.collection('emergencies').createIndex({ timestamp: 1 });
    await db.collection('locations').createIndex({ timestamp: 1 });
    console.log('Indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
}

// Start the server
async function startServer() {
  const db = await connectToDatabase();
  await createIndexes(db);
  setupFirebaseListeners(db);

  // Schedule cron job to delete old data daily
  cron.schedule('0 0 * * *', () => deleteOldData(db));

  // Start Express server
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer().catch(console.error);

process.on('SIGINT', async () => {
  console.log('Shutting down gracefully');
  if (client) {
    await client.close();
  }
  process.exit(0);
});

module.exports = app;
