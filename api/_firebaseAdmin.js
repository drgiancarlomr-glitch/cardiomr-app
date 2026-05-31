const admin = require('firebase-admin');

function getAdminApp() {
  if (admin.apps.length) return admin.app();
  const rawCredentials = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!rawCredentials) throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON no está configurado.');
  const credentials = JSON.parse(rawCredentials);
  return admin.initializeApp({
    credential: admin.credential.cert(credentials),
  });
}

function getFirestore() {
  getAdminApp();
  return admin.firestore();
}

function getMessaging() {
  getAdminApp();
  return admin.messaging();
}

module.exports = { getFirestore, getMessaging };
