const admin = require('firebase-admin');
let serviceAccount;

if (process.env.SERVICE_ACCOUNT_BASE64) {
  // Production: Decode from base64
  const serviceAccountJson = Buffer.from(process.env.SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
  serviceAccount = JSON.parse(serviceAccountJson);
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