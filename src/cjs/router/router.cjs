const rateLimitMiddleware = require("./middlewares/rateLimitMiddleware.cjs");
const httpsFirewallMiddleware = require("./middlewares/httpsFirewall.cjs");
const requestLoggerMiddleware = require("./middlewares/requestLoggerMiddleware.cjs");
const discordRequestLoggerMiddleware = require("./middlewares/discordRequestLoggerMiddleware.cjs");
const cacheMiddleware = require("./middlewares/cacheMiddleware.cjs");
const checkHeaderMiddleware = require("./middlewares/checkHeaderMiddleware.cjs");
const defaultRoutesMiddleware = require("./middlewares/defaultRoutesMiddleware.cjs");
const routerStatusMiddleware = require("./middlewares/routerStatusMiddleware.cjs");
const { exposePublicFolder, exposeLogsFolder } = require("../utils.cjs");
const routerLogsDash = require("./routerLogsDash.cjs");
const { autoLoader } = require("../autoFileSysModule.cjs");
const { pathTraversalMiddleware } = require("./middlewares/pathTraversalMiddleware.cjs");

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

/**
 * Registra todas as rotas e middlewares principais.
 *
 * @param {import("express").Router | import("express").Express} mainRouter
 * @returns {import("express").Router | import("express").Express}
 */
function registerRoutes(mainRouter) {
  httpsFirewallMiddleware(mainRouter); // SEMPRE primeiro devido ao cors
  rateLimitMiddleware(mainRouter);
  pathTraversalMiddleware(mainRouter);

  requestLoggerMiddleware(mainRouter);
  discordRequestLoggerMiddleware(mainRouter);
  cacheMiddleware(mainRouter);
  checkHeaderMiddleware(mainRouter);
  exposePublicFolder(mainRouter);
  logsDashboard(mainRouter);
  routerStatusMiddleware(mainRouter);
  defaultRoutesMiddleware(mainRouter);

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
  routerStatusMiddleware,
  checkHeaderMiddleware,
  cacheMiddleware,
};
