# Push notifications ANGIOGM

## Firebase

1. Crear un proyecto en Firebase.
2. Agregar una app web.
3. Activar Cloud Messaging API y FCM Registration API.
4. Crear una clave Web Push (VAPID) en Cloud Messaging.
5. Crear una base Firestore.
6. Crear una cuenta de servicio y descargar su JSON.

## Variables en Vercel

Agregar estas variables para Production, Preview y Development:

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_VAPID_KEY
FIREBASE_SERVICE_ACCOUNT_JSON
ADMIN_PUSH_SECRET
APP_URL=https://cardiomr-app.vercel.app
```

`FIREBASE_SERVICE_ACCOUNT_JSON` debe contener el JSON completo de la cuenta de servicio.
`ADMIN_PUSH_SECRET` debe ser una clave privada larga elegida por el administrador.

## Panel administrativo

Abrir:

```text
https://cardiomr-app.vercel.app/?admin=1
```

Ingresar la clave administrativa, título, mensaje y categoría. El envío se realiza a todos los dispositivos registrados.
