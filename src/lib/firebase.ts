import { getApp, getApps, initializeApp, type FirebaseOptions } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyByp5VeFvNpLgpBLie8lwBRm0sNyiCph3I",
  authDomain: "studio-2296895549-5fe2c.firebaseapp.com",
  projectId: "studio-2296895549-5fe2c",
  storageBucket: "studio-2296895549-5fe2c.appspot.com",
  messagingSenderId: "842772495994",
  appId: "1:842772495994:web:e962d2aa56c54ae3ee05c3",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Set persistence to local storage
setPersistence(auth, browserLocalPersistence);

export { app, auth, db };
