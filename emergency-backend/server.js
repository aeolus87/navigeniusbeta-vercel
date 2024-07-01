const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config({ path: './.env.local' });

const app = express();
const port = process.env.PORT2 || 5001;
const DB_NAME = 'Navigenius';

app.use(cors());
app.use(express.json());

async function deleteOldData(client) {
  const db = client.db(DB_NAME);
  const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);

  await db
    .collection('emergencies')
    .deleteMany({ timestamp: { $lt: fifteenDaysAgo } });
  await db
    .collection('locations')
    .deleteMany({ timestamp: { $lt: fifteenDaysAgo } });

  console.log('Old data deleted successfully');
}

// Schedule the task to run at midnight every day
cron.schedule('0 0 * * *', async () => {
  let client;
  try {
    client = await MongoClient.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await deleteOldData(client);
  } catch (error) {
    console.error('Error deleting old data:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
});

app.get('/api/getData', async (req, res) => {
  let client;
  try {
    client = await MongoClient.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = client.db(DB_NAME);

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
  } finally {
    if (client) {
      await client.close();
    }
  }
});

app.post('/api/storeData', async (req, res) => {
  let client;
  try {
    client = await MongoClient.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = client.db(DB_NAME);

    const { type, ...data } = req.body;

    // Ensure timestamp is a Date object
    data.timestamp = new Date(data.timestamp);

    if (type === 'emergency') {
      await db.collection('emergencies').insertOne(data);
    } else if (type === 'location') {
      await db.collection('locations').insertOne(data);
    }

    res.status(200).json({ message: 'Data stored successfully' });
  } catch (error) {
    console.error('Error storing data in MongoDB:', error);
    res.status(500).json({
      error: 'Error storing data in the database',
      details: error.message,
    });
  } finally {
    if (client) {
      await client.close();
    }
  }
});

// Create indexes for better query performance
async function createIndexes() {
  let client;
  try {
    client = await MongoClient.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = client.db(DB_NAME);

    await db.collection('emergencies').createIndex({ timestamp: 1 });
    await db.collection('locations').createIndex({ timestamp: 1 });

    console.log('Indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Call createIndexes when the server starts
createIndexes();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
