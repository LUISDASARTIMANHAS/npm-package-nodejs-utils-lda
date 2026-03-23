const routerCache = require("./cacheSys.cjs");
const routerLogsDash = require("./routerLogsDash.cjs");
const routerCheckHeaderMiddleware = require("./checkHeaderMiddleware.cjs");
const routerStatusDash = require("./routerStatusDash.cjs");
const  httpsSecurityMiddleware = require("./httpsSecurity.cjs");

/**
 * Registra rota dinâmica para listagem e acesso aos logs
 * @param {import("express").Express} app
 * @returns {boolean}
 */
function logsDashboard(mainRouter) {
  mainRouter.use("/logs", routerLogsDash);
  return mainRouter;
}

function StatusDashboard(mainRouter) {
  mainRouter.use("/", routerStatusDash);
  return mainRouter;
}

function checkHeaderMiddleware(app) {
  app.use("/*name", routerCheckHeaderMiddleware);
  return app;
}

function cacheMiddleware(app) {
  app.use("/", routerCache);
  return app;
}

/**
 * Registra todas as rotas e middlewares principais.
 *
 * @param {import("express").Router | import("express").Express} mainRouter
 * @returns {import("express").Router | import("express").Express}
 */
function registerRoutes(mainRouter) {
  logsDashboard(mainRouter);
  StatusDashboard(mainRouter);

  return mainRouter;
}


// utils.js ou no seu pacote
function applyAutoMiddlewares(app) {
  const requestLogger = require("./requestLogger.cjs");
  // Middlewares já aplicados ao app
  app.use(requestLogger);
  app.use(setCacheHeaders);
  app.use(httpsSecurityMiddleware);
  checkHeaderMiddleware(app);
  autoLoader(app);

  console.log(
    "\n\t[npm-package-nodejs-utils-lda] Automatic middlewares loaded!\n",
  );
}


module.exports = {
  registerRoutes,
  logsDashboard,
  StatusDashboard,
  checkHeaderMiddleware,
  cacheMiddleware,
};
