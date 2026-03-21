const admin = require("firebase-admin");

let serviceAccount;

if (process.env.FIREBASE_PRIVATE_KEY) {

  // 🔐 Production (Render)
  serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  };

} else {

  // 💻 Local (JSON file)
  serviceAccount = require("./serviceAccountKey.json");

}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = { admin, db };