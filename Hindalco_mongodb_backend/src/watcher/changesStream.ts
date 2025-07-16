import axios from 'axios';
import { MongoClient } from 'mongodb';
import qs from 'qs';

let client;

// Function to generate OAuth token
const generateOAuthToken = async (app) => {
  try {
    const decodedusername = Buffer.from(app.user, 'base64').toString('ascii');
    const decodedpassword = Buffer.from(app.password, 'base64').toString(
      'ascii',
    );
    const requestBody = qs.stringify({
      grant_type: 'password',
      client_id: 'admin-cli',
      username: decodedusername,
      password: decodedpassword,
    });

    const response = await axios.post(app.baseURL, requestBody, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.status === 200 ? response.data.access_token : null;
  } catch (error) {
    console.error('Error generating OAuth token:', error);
    return null;
  }
};

// Delay function
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
class WatcherManager {
  static watchers = new Map(); // Map to hold active watchers per collection

  static async getWatcher(db, collectionName, auditTrailCallback) {
    if (WatcherManager.watchers.has(collectionName)) {
      // Return existing watcher if already running
      return WatcherManager.watchers.get(collectionName);
    }

    // Create a new watcher
    const changeStream = db.collection(collectionName).watch(
      [
        {
          $match: { operationType: { $in: ['insert', 'update', 'delete'] } },
        },
      ],
      {
        fullDocument: 'updateLookup',
        fullDocumentBeforeChange: 'whenAvailable',
      },
    );

    // Handle changes
    const processedIds = new Set();
    changeStream.on('change', async (change) => {
      const documentId = change.documentKey._id.toString();
      if (!processedIds.has(documentId)) {
        processedIds.add(documentId);
        try {
          await auditTrailCallback(change);
        } catch (error) {
          console.error('Error processing change:', error);
        } finally {
          processedIds.delete(documentId); // Allow reprocessing if necessary
        }
      }
    });

    changeStream.on('error', (err) => {
      console.error('Change stream error:', err);
      WatcherManager.watchers.delete(collectionName); // Clean up on error
    });

    WatcherManager.watchers.set(collectionName, changeStream);
    return changeStream;
  }
}

// Main audit trail function
const auditTrail = async (
  collection,
  module,
  subModule,
  user,
  userId,
  randomNumber,
) => {
  //try {
    // client = await new MongoClient(process.env.MONGO_DB_URI1);
    // const db = client.db(process.env.MONGO_DB_NAME);

    // const handleChange = async (change) => {
    //   if (
    //     change.operationType === 'insert' ||
    //     change.operationType === 'update'
    //   ) {
    //     const updatedDoc = await db
    //       .collection(collection)
    //       .findOne({ _id: change.documentKey._id });

        // if (
        //   collection === 'kpireportinstances' &&
        //   updatedDoc.reportStatus === 'SUBMIT'
        // ) {
        //   const url = `${process.env.SERVER_IP}/api/kpi-report/writeToSummary?organizationId=${updatedDoc.organization}`;
        //   await delay(1000);
        //   try {
        //     const response = await axios.get(url);
        //     console.log('KPI API call successful', response.data);
        //   } catch (error) {
        //     console.log('Error:', error.message);
        //   }
        // }
      //}
    //};

    // await WatcherManager.getWatcher(db, collection, handleChange);
  // } catch (error) {
  //   console.error('Error starting audit trail:', error);
  // }
};

export default auditTrail;
