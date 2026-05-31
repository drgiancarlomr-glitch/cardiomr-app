/* global firebase */
importScripts('https://www.gstatic.com/firebasejs/12.14.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.14.0/firebase-messaging-compat.js');

const configParam = new URL(self.location.href).searchParams.get('config');

if (configParam) {
  const firebaseConfig = JSON.parse(decodeURIComponent(configParam));
  firebase.initializeApp(firebaseConfig);
  firebase.messaging();
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});
