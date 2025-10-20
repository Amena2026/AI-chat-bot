const admin = require('firebase-admin');

let serviceAccount;

// Check if running in production (Render) or local
if (process.env.SERVICE_ACCOUNT_JSON) {
  // Production: Use environment variable
  serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_JSON);
} else {
  // Local development: Use file
  serviceAccount = require('../serviceAccountKey.json');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

const db = admin.database();
const auth = admin.auth();

module.exports = { admin, db, auth };