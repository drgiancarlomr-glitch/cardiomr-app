import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
let messagingPromise;

function hasFirebaseConfig() {
  return Object.values(firebaseConfig).every(Boolean) && Boolean(vapidKey);
}

async function getMessagingClient() {
  if (!hasFirebaseConfig()) throw new Error('Firebase no está configurado.');
  if (!(await isSupported())) throw new Error('Este navegador no admite notificaciones push.');
  if (!messagingPromise) {
    const app = initializeApp(firebaseConfig);
    messagingPromise = Promise.resolve(getMessaging(app));
  }
  return messagingPromise;
}

async function registerMessagingWorker() {
  const config = encodeURIComponent(JSON.stringify(firebaseConfig));
  return navigator.serviceWorker.register(`/firebase-messaging-sw.js?config=${config}`);
}

async function saveToken(token) {
  const response = await fetch('/api/register-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  if (!response.ok) throw new Error('No se pudo guardar el dispositivo.');
}

export function notificationsAvailable() {
  return typeof window !== 'undefined'
    && 'Notification' in window
    && 'serviceWorker' in navigator
    && hasFirebaseConfig();
}

export async function activateNotifications() {
  if (!notificationsAvailable()) throw new Error('Las notificaciones todavía no están configuradas.');
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return { permission };
  const messaging = await getMessagingClient();
  const registration = await registerMessagingWorker();
  const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
  if (!token) throw new Error('No se pudo obtener el token de notificaciones.');
  await saveToken(token);
  return { permission, token };
}

export async function syncNotificationToken() {
  if (!notificationsAvailable() || Notification.permission !== 'granted') return;
  const messaging = await getMessagingClient();
  const registration = await registerMessagingWorker();
  const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
  if (token) await saveToken(token);
}

export async function listenForForegroundNotifications(callback) {
  if (!notificationsAvailable() || Notification.permission !== 'granted') return () => {};
  const messaging = await getMessagingClient();
  return onMessage(messaging, callback);
}
