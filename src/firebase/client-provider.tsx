
"use client";

import { useMemo, type ReactNode } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { FirebaseProvider } from "./provider";
import { firebaseConfig } from "./config"; // Import config from the new file

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseContextValue = useMemo(() => {
    if (!firebaseConfig.apiKey) {
      // This check is now mostly for type safety, as the config is hardcoded.
      console.error("Firebase API key is missing. Please check your firebase/config.ts file.");
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
