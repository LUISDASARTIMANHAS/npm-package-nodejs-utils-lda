const express = require("express");
const { logError, log } = require("../logger/index.cjs");
const routerAntiReplyMiddleware = express.Router();
const logPath = "securityAntiReply.log";
const recentNonces = new Map();

/**
 * Tempo máximo aceito entre cliente e servidor
 * @type {number}
 */
const TIME_LIMIT_MS = 30000;

/**
 * Intervalo de limpeza
 * @type {number}
 */
const CLEANUP_INTERVAL_MS = 10000;

/**
 * Limpeza automática de nonces expirados
 */
setInterval(() => {
  const now = Date.now();

  for (const [nonce, timestamp] of recentNonces.entries()) {
    if (now - timestamp > TIME_LIMIT_MS) {
      recentNonces.delete(nonce);
    }
  }
}, CLEANUP_INTERVAL_MS);

/**
 * @function antiReplayHandler
 * @description Handler interno de validação anti-replay
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns {void}
 */
function antiReplayHandler(req, res, next) {
  const nonce = req.headers["x-nonce"];
  const timestampRaw = req.headers["x-timestamp"];
  const timestamp = Number(timestampRaw);

  const originIP = req.ip || "N/A";
  const originUrl = req.originalUrl;

  /* ===== 1. Validação de presença ===== */

  if (!nonce || !timestampRaw) {
    return res.status(400).json({
      error: "Headers obrigatórios ausentes.",
      required_headers: {
        "x-nonce": "string (único por requisição)",
        "x-timestamp": "number (ms)",
      },
    });
  }

  if (isNaN(timestamp)) {
    return res.status(400).json({
      error: "x-timestamp inválido.",
    });
  }

  /* ===== 2. Validação de tempo ===== */

  const now = Date.now();
  const diff = Math.abs(now - timestamp);

  if (diff > TIME_LIMIT_MS) {
    log(
      `[ANTI-REPLAY WARN] Timestamp inválido (${diff}ms). Origem: ${originIP} em ${originUrl}`,
      logPath,
    );

    return res.status(401).json({
      error: "Timestamp expirado.",
      details: `Diferença de ${diff}ms (limite ${TIME_LIMIT_MS}ms)`,
    });
  }

  /* ===== 3. Replay attack ===== */

  if (recentNonces.has(nonce)) {
    logError(
      `[ANTI-REPLAY ALERT] Nonce reutilizado: ${nonce}. Origem: ${originIP} em ${originUrl}`,
      logPath,
    );

    return res.status(401).json({
      error: "Replay attack detectado.",
      details: "Nonce já utilizado recentemente.",
    });
  }

  /* ===== 4. Armazenamento */

  recentNonces.set(nonce, timestamp);

  next();
}

/**
 * 🔒 Aplica proteção automaticamente em TODAS rotas /api/*
 */
routerAntiReplyMiddleware.all("/api/*name", antiReplayHandler);

module.exports = routerAntiReplyMiddleware;
