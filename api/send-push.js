const { getFirestore, getMessaging } = require('./_firebaseAdmin');

const categories = new Set(['General', 'Medicación', 'Controles', 'Cuidados', 'Importante']);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido.' });
  if (!process.env.ADMIN_PUSH_SECRET || req.headers.authorization !== `Bearer ${process.env.ADMIN_PUSH_SECRET}`) {
    return res.status(401).json({ error: 'Clave incorrecta.' });
  }

  const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
  const category = categories.has(req.body?.category) ? req.body.category : 'General';
  if (!title || !message) return res.status(400).json({ error: 'Completá título y mensaje.' });

  try {
    const db = getFirestore();
    const snapshot = await db.collection('pushTokens').get();
    const devices = snapshot.docs.map((doc) => ({ id: doc.id, token: doc.data().token })).filter((item) => item.token);
    if (!devices.length) return res.status(200).json({ ok: true, sent: 0, failed: 0 });

    const appUrl = process.env.APP_URL || 'https://cardiomr-app.vercel.app';
    let sent = 0;
    let failed = 0;
    for (let index = 0; index < devices.length; index += 500) {
      const batch = devices.slice(index, index + 500);
      const response = await getMessaging().sendEachForMulticast({
        tokens: batch.map((item) => item.token),
        notification: { title, body: message },
        data: { category, url: appUrl },
        webpush: { fcmOptions: { link: appUrl } },
      });
      sent += response.successCount;
      failed += response.failureCount;
      await Promise.all(response.responses.map((result, itemIndex) => {
        if (result.success) return Promise.resolve();
        const code = result.error?.code || '';
        if (!code.includes('registration-token-not-registered') && !code.includes('invalid-registration-token')) {
          return Promise.resolve();
        }
        return db.collection('pushTokens').doc(batch[itemIndex].id).delete();
      }));
    }
    return res.status(200).json({ ok: true, sent, failed });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'No se pudo enviar la notificación.' });
  }
};
