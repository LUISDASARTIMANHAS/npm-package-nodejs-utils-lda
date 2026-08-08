import rateLimit from "express-rate-limit";

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

  statusCode: 429,

  message: {
    type: "[RateLimit]",
    error:
      "[npm-package-nodejs-utils-lda] Muitas requisições. Tente novamente mais tarde.",
  },

  /**
   * Executado quando o limite é atingido.
   *
   * Mantemos o log no servidor e não expomos
   * informações internas ao cliente.
   */
  handler: (req, res, next, options) => {
    const userAgent = req.get("user-agent") || "N/A";
    const origin =
      req.get("referer") ||
      req.get("referrer") ||
      "N/A";

    console.warn(
      `[RateLimit] Request blocked | ` +
        `IP: ${req.ip || "N/A"} | ` +
        `Method: ${req.method} | ` +
        `URL: ${req.originalUrl || "N/A"} | ` +
        `User-Agent: ${userAgent} | ` +
        `Referer: ${origin}`
    );

    res.status(options.statusCode).json(options.message);
  },

  /**
   * Executado quando uma requisição é aceita
   * e o rate limiter atualiza o contador.
   */
  requestWasSuccessful: (req, res) => {
    return res.statusCode < 400;
  },
});

/**
 * Aplica o rate limiter padrão.
 *
 * @param {import("express").Express | import("express").Router} app
 * @returns {import("express").Express | import("express").Router}
 */
export function rateLimitMiddleware(app) {
  app.use(defaultRateLimiter);

  console.log(
    "\n\t[npm-package-nodejs-utils-lda] [RateLimit] loaded!"
  );

  return app;
}

export default rateLimitMiddleware;