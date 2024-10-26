/**
 * Firebase Messaging Service Worker
 * This script handles background push notifications for Firebase Cloud Messaging.
 */

importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyCWz2LR4WyHW1BVN7WvFm21a_9YMrVFgvQ",
    authDomain: "softmax-tech.firebaseapp.com",
    projectId: "softmax-tech",
    storageBucket: "softmax-tech.appspot.com",
    messagingSenderId: "351161248301",
    appId: "1:351161248301:web:0a0957378b835a714ae6a4",
    measurementId: "G-67LY9CC0TP",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log("[firebase-messaging-sw.js] Received background message ", payload);

    const notificationOptions = {
        title: payload.notification.title || 'New Notification',
        body: payload.notification.body || 'You have a new notification',
        icon: "/logo.png",
        badge: "/badge.png",
        tag: 'notification-' + Date.now(),
        data: { url: payload.fcmOptions?.link || payload.data?.link || '/' },
        actions: [
            { action: 'open', title: 'Open' },
            { action: 'close', title: 'Close' }
        ]
    };

    return self.registration.showNotification(notificationOptions.title, notificationOptions);
});

self.addEventListener("notificationclick", (event) => {
    console.log("[firebase-messaging-sw.js] Notification click received.", event);
    event.notification.close();

    const url = event.notification.data.url;
    if (!url) return;

    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true })
            .then((clientList) => {
                for (const client of clientList) {
                    if (client.url === url && "focus" in client) return client.focus();
                }
                if (clients.openWindow) return clients.openWindow(url);
            })
    );
});