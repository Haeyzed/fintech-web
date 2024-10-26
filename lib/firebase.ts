import { getApp, getApps, initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";
import Env from "@/lib/env";

/**
 * Firebase configuration object
 */
const firebaseConfig = {
  apiKey: Env.FIREBASE_CONFIG.apiKey,
  authDomain: Env.FIREBASE_CONFIG.authDomain,
  projectId: Env.FIREBASE_CONFIG.projectId,
  storageBucket: Env.FIREBASE_CONFIG.storageBucket,
  messagingSenderId: Env.FIREBASE_CONFIG.messagingSenderId,
  appId: Env.FIREBASE_CONFIG.appId
};

/**
 * Initialize Firebase app
 */
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

/**
 * Get Firebase Messaging instance if supported
 * @returns {Promise<Messaging | null>} Firebase Messaging instance or null if not supported
 */
const messaging = async () => {
  try {
    if (await isSupported()) {
      const messaging = getMessaging(app);
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('Service Worker registered with scope:', registration.scope);
      }
      return messaging;
    }
  } catch (err) {
    console.error('Error initializing messaging:', err);
  }
  return null;
};

/**
 * Fetch Firebase Cloud Messaging token
 * @returns {Promise<string | null>} FCM token or null if not available
 */
export const fetchToken = async () => {
  try {
    const fcmMessaging = await messaging();
    if (fcmMessaging) {
      return await getToken(fcmMessaging, { vapidKey: Env.FIREBASE_CONFIG.vapidKey });
    }
  } catch (err) {
    console.error("An error occurred while fetching the token:", err);
  }
  return null;
};

export { app, messaging };