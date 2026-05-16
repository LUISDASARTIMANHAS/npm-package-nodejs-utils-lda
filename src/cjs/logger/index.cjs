const { baseLog } = require("./core.cjs");

/**
 * Log padrão
 * @param {any} message
 * @param {string} filename
 * @param {number} maxLength
 * @return {void}
 */
function log(message, filename, maxLength) {
  baseLog({
    message,
    filename,
    maxLength,
    level: "info",
    consoleFn: console.log,
  });
}

/**
 * Log de erro
 * @param {any} message
 * @param {string} filename
 * @param {number} maxLength
 * @return {void}
 */
function logError(message, filename, maxLength) {
  baseLog({
    message,
    filename,
    maxLength,
    level: "error",
    consoleFn: console.error,
  });
}

/**
 * Log request
 * @param {object} req
 * @param {any} message
 * @param {string} filename
 * @param {number} maxLength
 * @return {void}
 */
function logRequest(req, warning, filename, maxLength = 512) {
  const userAgent = req.headers["user-agent"] || "Desconhecido";
  const ip =
    req.headers["x-forwarded-for"] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    "IP não detectado";
  const referer = req.headers["referer"] || "Sem referer";
  let message = `
    \tREQ ${req.method} ${req.originalUrl}
    \tIP=${ip}, Referer=${referer}
    \tUA=${userAgent}
    `;
  if (warning) {
    message = `
    \t${warning}
    \tREQ ${req.method} ${req.originalUrl}
    \tIP=${ip}, Referer=${referer}
    \tUA=${userAgent}
    `;
  }
  baseLog({
    message,
    filename,
    maxLength,
    level: "info",
    consoleFn: console.log,
  });
}

module.exports = { log, logError, logRequest };
