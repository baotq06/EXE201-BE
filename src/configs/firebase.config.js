require('dotenv').config();
const admin = require('firebase-admin');

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

const certification = {
  "type": process.env.FIREBASE_CERT_TYPE,
  "project_id": process.env.FIREBASE_CERT_PROJECT_ID,
  "private_key_id": process.env.FIREBASE_CERT_PRIVATE_KEY_ID.replace(/\\n/g, '\n'),
  "private_key": process.env.FIREBASE_CERT_PRIVATE_KEY,
  "client_email": process.env.FIREBASE_CERT_CLIENT_EMAIL,
  "client_id": process.env.FIREBASE_CERT_CLIENT_ID,
  "auth_uri": process.env.FIREBASE_CERT_AUTH_URI,
  "token_uri": process.env.FIREBASE_CERT_TOKEN_URI,
  "auth_provider_x509_cert_url": process.env.FIREBASE_CERT_AUTH_PROVIDER_X509_CERT_URL,
  "client_x509_cert_url": process.env.FIREBASE_CERT_CLIENT_X509_CERT_URL,
  "universe_domain": process.env.FIREBASE_CERT_UNIVERSE_DOMAIN,
}

admin.initializeApp({
  credential: admin.credential.cert(certification),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

module.exports = {firebaseConfig, admin};