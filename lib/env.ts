export default class Env {
    static API_URL: string = process.env.NEXT_PUBLIC_API_URL as string;

    static FIREBASE_CONFIG = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY as string,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET as string,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID as string,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID as string,
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY as string,
    };
}