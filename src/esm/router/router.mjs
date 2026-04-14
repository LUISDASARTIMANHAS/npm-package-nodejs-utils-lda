import routerCache from "./cacheSys.mjs";
import routerLogsDash from "./routerLogsDash.mjs";
import routerCheckHeaderMiddleware from "./checkHeaderMiddleware.mjs";
import routerAntiReplyMiddleware from "../security/antiReplay.mjs";
import routerStatusDash from "./routerStatusDash.mjs";
import httpsFirewall from "./httpsFirewall.mjs";
import routerRequestLogger from "./requestLoggerMiddleware.mjs";
import { exposeLogsFolder, exposePublicFolder } from "../utils.mjs";

/**
 * Registra rota dinâmica para listagem e acesso aos logs
 * @param {import("express").Express} app
 * @returns {boolean}
 */
export function logsDashboard(mainRouter) {
  // e necessario expor a pasta primeiro antes de ter uma rota
  exposeLogsFolder(mainRouter);

  mainRouter.use("/logs", routerLogsDash);
  console.log("\n\t[npm-package-nodejs-utils-lda] [LogsDash] loaded!");
  return mainRouter;
}

export function StatusDashboard(mainRouter) {
  mainRouter.use("/", routerStatusDash);
  console.log("\n\t[npm-package-nodejs-utils-lda] [StatusDash] loaded!");
  return mainRouter;
}

export function requestLoggerMiddleware(mainRouter) {
  mainRouter.use(routerRequestLogger);
  console.log("\n\t[npm-package-nodejs-utils-lda] [requestLogger] loaded!");
  return mainRouter;
}

export function httpsFirewallMiddleware(app) {
  app.use(httpsFirewall);
  console.log("\n\t[npm-package-nodejs-utils-lda] [httpsFirewall] loaded!");
  return app;
}

export function checkHeaderMiddleware(app) {
  antiReplyMiddleware(app); // 🔥 primeiro (segurança)
  app.use(routerCheckHeaderMiddleware); // depois auth
  console.log("\n\t[npm-package-nodejs-utils-lda] [checkHeaderMiddleware] loaded!");
  return app;
}

export function antiReplyMiddleware(app) {
  app.use(routerAntiReplyMiddleware);
  console.log("\n\t[npm-package-nodejs-utils-lda] [antiReplyMiddleware] loaded!");
  return app;
}

export function cacheMiddleware(app) {
  app.use(routerCache);
  console.log("\n\t[npm-package-nodejs-utils-lda] [cacheMiddleware] loaded!");
  return app;
}

/**
 * Registra todas as rotas e middlewares principais.
 *
 * @param {import("express").Router | import("express").Express} mainRouter
 * @returns {import("express").Router | import("express").Express}
 */
export function registerRoutes(mainRouter) {
  httpsFirewallMiddleware(mainRouter); // SEMPRE primeiro devido ao cors
  requestLoggerMiddleware(mainRouter);
  cacheMiddleware(mainRouter)
  checkHeaderMiddleware(mainRouter);
  exposePublicFolder(mainRouter);
  logsDashboard(mainRouter);
  StatusDashboard(mainRouter);

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
