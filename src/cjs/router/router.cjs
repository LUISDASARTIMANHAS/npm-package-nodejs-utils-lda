const routerCache = require("./cacheSys.cjs");
const routerLogsDash = require("./routerLogsDash.cjs");
const routerCheckHeaderMiddleware = require("./checkHeaderMiddleware.cjs");
const routerStatusDash = require("./routerStatusDash.cjs");
const httpsFirewall = require("./httpsFirewall.cjs");
const routerRequestLogger = require("./requestLoggerMiddleware.cjs");
const { autoLoader } = require("../autoFileSysModule.cjs");
const { exposeLogsFolder, exposePublicFolder } = require("../utils.cjs");

/**
 * Registra rota dinâmica para listagem e acesso aos logs
 * @param {import("express").Express} app
 * @returns {boolean}
 */
function logsDashboard(mainRouter) {
  // e necessario expor a pasta primeiro antes de ter uma rota
  exposeLogsFolder(mainRouter);

  mainRouter.use("/logs", routerLogsDash);
  console.log("\n\t[npm-package-nodejs-utils-lda] [LogsDash] loaded!");
  return mainRouter;
}

function StatusDashboard(mainRouter) {
  mainRouter.use("/", routerStatusDash);
  console.log("\n\t[npm-package-nodejs-utils-lda] [StatusDash] loaded!");
  return mainRouter;
}

function requestLoggerMiddleware(mainRouter) {
  mainRouter.use(routerRequestLogger);
  console.log("\n\t[npm-package-nodejs-utils-lda] [requestLogger] loaded!");
  return mainRouter;
}

function httpsFirewallMiddleware(app) {
  app.use(httpsFirewall);
  console.log("\n\t[npm-package-nodejs-utils-lda] [httpsFirewall] loaded!");
  return app;
}

function checkHeaderMiddleware(app) {
  app.use(routerCheckHeaderMiddleware);
  console.log(
    "\n\t[npm-package-nodejs-utils-lda] [checkHeaderMiddleware] loaded!",
  );
  return app;
}

function cacheMiddleware(app) {
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
function registerRoutes(mainRouter) {
  requestLoggerMiddleware(mainRouter);
  cacheMiddleware(mainRouter);
  httpsFirewallMiddleware(mainRouter);
  checkHeaderMiddleware(mainRouter);
  exposePublicFolder(mainRouter);
  logsDashboard(mainRouter);
  StatusDashboard(mainRouter);

  console.log(
    "\n\t[npm-package-nodejs-utils-lda] [registerRoutes] Registered!\n",
  );

  return mainRouter;
}

// utils.js ou no seu pacote
function applyAutoMiddlewares(app) {
  // Middlewares já aplicados ao app
  registerRoutes(app);
  autoLoader(app);

  console.log(
    "\n\t[npm-package-nodejs-utils-lda] Automatic middlewares loaded!\n",
  );
}

module.exports = {
  registerRoutes,
  applyAutoMiddlewares,
  requestLoggerMiddleware,
  httpsFirewallMiddleware,
  logsDashboard,
  StatusDashboard,
  checkHeaderMiddleware,
  cacheMiddleware,
};
