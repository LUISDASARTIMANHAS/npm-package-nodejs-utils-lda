const { decryptAESKey, decryptAESGCM } = require('./crypto.service.cjs');

const recentNonces = new Set();

/**
 * Middleware Express para processar payloads criptografados
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function encryptedPayloadMiddleware(req, res, next) {
	try {
		const {
			encryptedData,
			encryptedKey,
			iv,
			authTag,
			timestamp,
			nonce
		} = req.body;

		/* ===== Validação básica ===== */

		if (!encryptedData || !encryptedKey || !iv || !authTag || !timestamp || !nonce) {
			return res.status(400).json({ error: 'Payload criptografado incompleto' });
		}

		/* ===== Validação de tempo ===== */

		const now = Date.now();
		if (Math.abs(now - timestamp) > 30000) {
			return res.status(401).json({ error: 'Timestamp inválido' });
		}

		/* ===== Proteção contra replay ===== */

		if (recentNonces.has(nonce)) {
			return res.status(401).json({ error: 'Nonce reutilizado' });
		}

		recentNonces.add(nonce);
		setTimeout(() => recentNonces.delete(nonce), 30000);

		/* ===== Descriptografia ===== */

		const aesKey = decryptAESKey(encryptedKey);
		const plaintext = decryptAESGCM(encryptedData, aesKey, iv, authTag);

		/**
		 * 🔑 Dado descriptografado disponível
		 * para as próximas rotas/middlewares
		 */
		req.decryptedBody = JSON.parse(plaintext);

		next();
	} catch (err) {
		console.error('Erro no middleware criptográfico:', err.message);
		return res.status(400).json({ error: 'Falha ao descriptografar payload' });
	}
}

module.exports = encryptedPayloadMiddleware;
