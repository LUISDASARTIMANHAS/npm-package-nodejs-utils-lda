import { decryptAESKey, decryptAESGCM } from "./crypto.service.mjs";

const recentNonces = new Set();

/**
 * Middleware Express para processar payloads criptografados
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function encryptedPayloadMiddleware(req, res, next) {
  try {
    const { encryptedData, encryptedKey, iv, authTag, timestamp, nonce } =
      req.body;

    if (
      !encryptedData ||
      !encryptedKey ||
      !iv ||
      !authTag ||
      !timestamp ||
      !nonce
    ) {
      return res
        .status(400)
        .json({ error: "Payload criptografado incompleto" });
    }

    const now = Date.now();
    if (Math.abs(now - timestamp) > 30000)
      return res.status(401).json({ error: "Timestamp inválido" });

    if (recentNonces.has(nonce))
      return res.status(401).json({ error: "Nonce reutilizado" });

    recentNonces.add(nonce);
    setTimeout(() => recentNonces.delete(nonce), 30000);

    const aesKey = decryptAESKey(encryptedKey);
    const plaintext = decryptAESGCM(encryptedData, aesKey, iv, authTag);

    req.decryptedBody = JSON.parse(plaintext);

    next();
  } catch (err) {
    console.error("Erro no middleware criptográfico:", err.message);
    return res.status(400).json({ error: "Falha ao descriptografar payload" });
  }
}
