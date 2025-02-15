import firebase from "firebase/app";
import "firebase/database";
import "firebase/storage";
import "firebase/auth";

// Initialize Firebase
const config = {
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.VUE_APP_FIREBASE_DB_URL,
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_FIREBASE_MSG_SENDER_ID
};

firebase.initializeApp(config);

const db = firebase.database();
const storage = firebase.storage();
const auth = firebase.auth();

export { db, storage, auth };
export default firebase;
