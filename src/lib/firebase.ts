"use client";

import { getApp, getApps, initializeApp, type FirebaseOptions } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const getFirebaseApp = () => {
    if (getApps().length > 0) {
        return getApp();
    }
    
    // This is a placeholder for server-side config injection
    // In a real deployed environment, this config would be fetched or injected securely
    const firebaseConfig: FirebaseOptions = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
    
    if (!firebaseConfig.apiKey) {
      // In a real app, you'd want to fetch this from a secure endpoint.
      // For this environment, we'll try to retrieve it from a window object
      // if it was injected by the server.
      if (typeof window !== 'undefined' && (window as any).__FIREBASE_CONFIG__) {
        Object.assign(firebaseConfig, (window as any).__FIREBASE_CONFIG__);
      } else {
        console.error("Firebase config is not available.");
        // We are returning a dummy config to avoid crashing the app on initialization.
        // The app will not work correctly, but it will not crash.
         return initializeApp({
            apiKey: "invalid",
            authDomain: "invalid",
            projectId: "invalid",
            storageBucket: "invalid",
            messagingSenderId: "invalid",
            appId: "invalid"
        });
      }
    }

    return initializeApp(firebaseConfig);
}

const app = getFirebaseApp();
const auth = getAuth(app);
const db = getFirestore(app);

if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence);
}

export { app, auth, db };
