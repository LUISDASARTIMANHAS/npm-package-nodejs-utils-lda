const rateLimit = require("express-rate-limit");

/**
 * Rate limiter padrão da biblioteca.
 *
 * Protege as rotas contra excesso de requisições
 * e reduz o risco de DoS causado por operações
 * custosas dentro dos handlers.
 */
const defaultRateLimiter = rateLimit({
  windowMs: 60 * 1000,

  // 100 requisições por minuto por IP.
  limit: 100,

  standardHeaders: "draft-7",
  legacyHeaders: false,

  message: {
    error: "Muitas requisições. Tente novamente mais tarde.",
  },
});

/**
 * Aplica o rate limiter padrão.
 *
 * @param {import("express").Express | import("express").Router} app
 * @returns {import("express").Express | import("express").Router}
 */
function rateLimitMiddleware(app) {
  app.use(defaultRateLimiter);

  console.log("\n\t[npm-package-nodejs-utils-lda] [RateLimit] loaded!");

  return app;
}

module.exports = rateLimitMiddleware;
