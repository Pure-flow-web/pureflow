"use client";

import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';

// Export hooks and providers
export * from './provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './client-provider';


let firebaseApp: ReturnType<typeof initializeApp>;

export function initializeFirebase(options: FirebaseOptions) {
  if (getApps().length === 0) {
    firebaseApp = initializeApp(options);
    return firebaseApp;
  } else {
    firebaseApp = getApp();
    return firebaseApp;
  }
}
