"use client";

import { useMemo, type ReactNode } from "react";
import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { FirebaseProvider } from "./provider";

interface FirebaseClientProviderProps {
  children: ReactNode;
}

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseContextValue = useMemo(() => {
    if (!firebaseConfig.apiKey) {
      console.error("Firebase API key is missing. Please check your environment variables.");
      return { app: null, auth: null, db: null };
    }
    
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    return { app, auth, db };
  }, []);

  return (
    <FirebaseProvider value={firebaseContextValue}>
        {children}
    </FirebaseProvider>
  );
}