import { decryptAESKey, decryptAESGCM } from "./crypto.service.mjs";

const recentNonces = new Set();
const TIME_LIMIT_MS = 30_000;

/**
 * Valida a presença dos campos necessários do payload.
 *
 * Os detalhes dessa estrutura não são expostos ao cliente.
 *
 * @param {object} body
 * @returns {boolean}
 */
function hasRequiredPayloadFields(body) {
  if (!body || typeof body !== "object") {
    return false;
  }

  const requiredFields = [
    "encryptedData",
    "encryptedKey",
    "iv",
    "authTag",
    "timestamp",
    "nonce",
  ];

  return requiredFields.every((field) => {
    return (
      body[field] !== undefined && body[field] !== null && body[field] !== ""
    );
  });
}

/**
 * 🛡️ Middleware Express para processar payloads criptografados.
 *
 * Segurança:
 * - Não expõe detalhes da implementação criptográfica.
 * - Não retorna err.message para o cliente.
 * - Não informa quais componentes criptográficos falharam.
 * - Não expõe o formato interno do payload.
 * - Mantém os detalhes técnicos apenas nos logs do servidor.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns {void}
 */
export function encryptedPayloadMiddleware(req, res, next) {
  const originIP = req.ip || "N/A";
  const originUrl = req.originalUrl;

  try {
    const { encryptedData, encryptedKey, iv, authTag, timestamp, nonce } =
      req.body || {};

    /* =========================================================
     * 1. Validação estrutural
     * ======================================================= */

    if (!hasRequiredPayloadFields(req.body)) {
      console.warn(
        `[CRYPTO WARN | 400] Payload criptográfico inválido. ` +
          `Origem: ${originIP} em ${originUrl}`,
      );

      return res.status(400).json({
        error: "Payload inválido.",
      });
    }

    /* =========================================================
     * 2. Validação do timestamp
     * ======================================================= */

    if (typeof timestamp !== "number" || !Number.isFinite(timestamp)) {
      console.warn(
        `[CRYPTO WARN | 401] Timestamp inválido. ` +
          `Origem: ${originIP} em ${originUrl}`,
      );

      return res.status(401).json({
        error: "Requisição inválida ou expirada.",
      });
    }

    const now = Date.now();
    const timeDiff = Math.abs(now - timestamp);

    if (timeDiff > TIME_LIMIT_MS) {
      console.warn(
        `[CRYPTO WARN | 401] Payload expirado. ` +
          `Diferença: ${timeDiff}ms. ` +
          `Origem: ${originIP} em ${originUrl}`,
      );

      return res.status(401).json({
        error: "Requisição inválida ou expirada.",
      });
    }

    /* =========================================================
     * 3. Proteção contra replay
     * ======================================================= */

    if (recentNonces.has(nonce)) {
      console.warn(
        `[CRYPTO SECURITY | 401] Possível replay detectado. ` +
          `Origem: ${originIP} em ${originUrl}`,
      );

      return res.status(401).json({
        error: "Requisição inválida.",
      });
    }

    /*
     * Registra o nonce antes da descriptografia.
     *
     * Isso impede que o mesmo payload seja reutilizado
     * em múltiplas tentativas dentro da janela de validade.
     */
    recentNonces.add(nonce);

    setTimeout(() => {
      recentNonces.delete(nonce);
    }, TIME_LIMIT_MS);

    /* =========================================================
     * 4. Descriptografia
     * ======================================================= */

    const aesKey = decryptAESKey(encryptedKey);

    const plaintext = decryptAESGCM(encryptedData, aesKey, iv, authTag);

    /* =========================================================
     * 5. Parse do conteúdo descriptografado
     * ======================================================= */

    let decryptedBody;

    try {
      decryptedBody = JSON.parse(plaintext);
    } catch (parseError) {
      console.warn(
        `[CRYPTO WARN | 400] Payload descriptografado inválido. ` +
          `Origem: ${originIP} em ${originUrl}`,
      );

      return res.status(400).json({
        error: "Payload inválido.",
      });
    }

    /* =========================================================
     * 6. Sucesso
     * ======================================================= */

    console.log(
      `[CRYPTO SUCCESS | 200] Payload descriptografado com sucesso. ` +
        `Origem: ${originIP} em ${originUrl}`,
    );

    req.decryptedBody = decryptedBody;

    return next();
  } catch (err) {
    /*
     * IMPORTANTE:
     *
     * Nunca enviar err.message para o cliente.
     *
     * O erro original pode revelar informações sobre:
     * - algoritmo criptográfico;
     * - provider utilizado;
     * - autenticação GCM;
     * - IV;
     * - AuthTag;
     * - Base64;
     * - estrutura esperada do payload.
     */

    console.error(
      `[CRYPTO ERROR | 400] Falha ao processar payload criptográfico. ` +
        `Origem: ${originIP} em ${originUrl}`,
      {
        error: err,
      },
    );

    return res.status(400).json({
      error: "Não foi possível processar a requisição.",
    });
  }
}
