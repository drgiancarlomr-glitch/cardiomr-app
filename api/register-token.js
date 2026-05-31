const crypto = require('crypto');
const { getFirestore } = require('./_firebaseAdmin');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido.' });
  const token = typeof req.body?.token === 'string' ? req.body.token.trim() : '';
  if (!token || token.length > 4096) return res.status(400).json({ error: 'Token inválido.' });

  try {
    const id = crypto.createHash('sha256').update(token).digest('hex');
    await getFirestore().collection('pushTokens').doc(id).set({
      token,
      updatedAt: new Date().toISOString(),
      userAgent: req.headers['user-agent'] || '',
    }, { merge: true });
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'No se pudo guardar el token.' });
  }
};
