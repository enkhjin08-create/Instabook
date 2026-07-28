// netlify/functions/_shared/firebase.js
// Firebase Admin SDK-г нэг л удаа эхлүүлж, бусад функцүүд дундаа хуваалцана.

const admin = require("firebase-admin");

function getDb() {
  if (!admin.apps.length) {
    const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;

    if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
      throw new Error(
        "Firebase тохиргоо дутуу байна: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY environment variable шаардлагатай."
      );
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        // Netlify env variable дотор шинэ мөр (\n) чинарын тэмдэгт болж хадгалагддаг
        // тул бодит шинэ мөр рүү хөрвүүлнэ
        privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
  }
  return admin.firestore();
}

module.exports = { getDb };
