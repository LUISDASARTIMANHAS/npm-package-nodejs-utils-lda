import { decryptAESKey, decryptAESGCM } from "./crypto.service.mjs";

const recentNonces = new Set();
const TIME_LIMIT_MS = 30000; // 30 segundos

// 💡 Função auxiliar para validar e coletar erros (Clean Code)
/**
 * @function validatePayloadFields
 * @description Verifica a presença de todos os campos criptográficos necessários.
 *
 * @param {object} body - O corpo da requisição Express (req.body).
 * @returns {string[] | null} Uma array de strings com os campos faltantes, ou null se tudo estiver ok.
 */
function validatePayloadFields(body) {
  const requiredFields = [
    "encryptedData",
    "encryptedKey",
    "iv",
    "authTag",
    "timestamp",
    "nonce",
  ];

  const missingFields = requiredFields.filter((field) => !body[field]);

  return missingFields.length > 0 ? missingFields : null;
}

/**
 * 🛡️ Middleware Express para processar payloads criptografados com validação detalhada e logs de segurança.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {void}
 */
export function encryptedPayloadMiddleware(req, res, next) {
  // Captura o IP de origem e a URL original para logs de segurança
  const originIP = req.ip || "N/A";
  const originUrl = req.originalUrl;

  try {
    const { encryptedData, encryptedKey, iv, authTag, timestamp, nonce } =
      req.body;

    /* ===== 1. Validação básica (Payload Incompleto) ===== */

    const missing = validatePayloadFields(req.body);

    if (missing) {
      const errorMsg = `Payload criptografado incompleto. Campos faltantes: ${missing.join(
        ", "
      )}. Certifique-se de enviar todos os componentes criptográficos.`;

      // ⚠️ Log para o Administrador (Falha de Cliente)
      console.warn(
        `[CRYPTO WARN | 400] Payload incompleto. Faltando: ${missing.join(
          ", "
        )}. Origem: ${originIP} em ${originUrl}`
      );

      return res.status(400).json({
        error: errorMsg,
        missing_fields: missing,
        required_format: {
          encryptedData: "string (base64)",
          encryptedKey: "string (base64)",
          iv: "string (base64)",
          authTag: "string (base64)",
          timestamp: "number (ms)",
          nonce: "string",
        },
      });
    }

    /* ===== 2. Validação de tempo (Time/Sync Fail) ===== */

    const now = Date.now();
    const timeDiff = Math.abs(now - timestamp);

    if (timeDiff > TIME_LIMIT_MS) {
      // ⚠️ Log para o Administrador (Falha de Sincronia)
      console.warn(
        `[CRYPTO WARN | 401] Timestamp inválido. Diferença de ${timeDiff}ms (Limite: ${TIME_LIMIT_MS}ms). Origem: ${originIP} em ${originUrl}`
      );

      return res.status(401).json({
        error: "Timestamp inválido ou expirado.",
        details: `Diferença de tempo de ${timeDiff}ms, excedendo o limite de ${TIME_LIMIT_MS}ms (30 segundos). Verifique a sincronia do seu relógio.`,
      });
    }

    /* ===== 3. Proteção contra replay (Ataque Potencial) ===== */

    if (recentNonces.has(nonce)) {
      // 🔥 Log de ALERTA DE SEGURANÇA para o Administrador (Ataque de Replay)
      console.error(
        `[CRYPTO SECURITY ALERT | 401] Nonce Reutilizado (Replay Attack Detectado!). Nonce: ${nonce}. Origem: ${originIP} em ${originUrl}`
      );

      return res.status(401).json({
        error: "Nonce reutilizado (Replay Attack Detected).",
        details:
          "Este Nonce foi usado recentemente. Gere um novo Nonce único para cada requisição.",
      });
    }

    recentNonces.add(nonce);
    setTimeout(() => recentNonces.delete(nonce), TIME_LIMIT_MS);

    /* ===== 4. Descriptografia ===== */

    const aesKey = decryptAESKey(encryptedKey);
    const plaintext = decryptAESGCM(encryptedData, aesKey, iv, authTag);

    // ✅ Log de SUCESSO
    console.log(
      `[CRYPTO SUCCESS | 200] Payload descriptografado com sucesso. Origem: ${originIP} em ${originUrl}`
    );

    /**
     * 🔑 Dado descriptografado disponível
     * para as próximas rotas/middlewares
     */
    req.decryptedBody = JSON.parse(plaintext);

    next();
  } catch (err) {
    // ❌ Log de Erro Grave (Falha de Descriptografia)
    console.error(
      `[CRYPTO FATAL ERROR | 400] Falha ao descriptografar payload. Causa: ${err.message}. Origem: ${originIP} em ${originUrl}`
    );

    return res.status(400).json({
      error: "Falha ao descriptografar payload.",
      details:
        "Verifique se a chave de criptografia, IV ou AuthTag estão corretos e se o formato Base64 é válido.",
    });
  }
}
