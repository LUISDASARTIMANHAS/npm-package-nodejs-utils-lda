import { exposePublicFolder } from "../utils.mjs";
import cacheMiddleware from "./middlewares/cacheSys.mjs";
import defaultRoutesMiddleware from "./middlewares/defaultRoutesMiddleware.mjs";
import checkHeaderMiddleware from "./middlewares/checkHeaderMiddleware.mjs";
import discordRequestLoggerMiddleware from "./middlewares/discordRequestLoggerMiddleware.mjs";
import httpsFirewallMiddleware from "./middlewares/httpsFirewall.mjs";
import rateLimitMiddleware from "./middlewares/rateLimitMiddleware.mjs";
import requestLoggerMiddleware from "./middlewares/requestLoggerMiddleware.mjs";
import logsDashboardMiddleWare from "./middlewares/routerLogsDash.mjs";
import routerStatusDash from "./middlewares/routerStatusDash.mjs";
import routerStatusMiddleware from "./middlewares/routerStatusMiddleware.mjs";

/**
 * Registra todas as rotas e middlewares principais.
 *
 * @param {import("express").Router | import("express").Express} mainRouter
 * @returns {import("express").Router | import("express").Express}
 */
export function registerRoutes(mainRouter) {
  httpsFirewallMiddleware(mainRouter); // SEMPRE primeiro devido ao cors
  rateLimitMiddleware(mainRouter);

  requestLoggerMiddleware(mainRouter);
  discordRequestLoggerMiddleware(mainRouter);
  cacheMiddleware(mainRouter)
  checkHeaderMiddleware(mainRouter);
  exposePublicFolder(mainRouter);
  logsDashboardMiddleWare(mainRouter);
  routerStatusMiddleware(mainRouter);
  defaultRoutesMiddleware(mainRouter);

  console.log(
    "\n\t[npm-package-nodejs-utils-lda] [registerRoutes] Registered!\n",
  );

  return mainRouter;
}

export function applyAutoMiddlewares(app) {
  // Middlewares já aplicados ao app
  registerRoutes(app)

  console.log(
    "\n\t[npm-package-nodejs-utils-lda] Automatic middlewares loaded!\n",
  );
}
