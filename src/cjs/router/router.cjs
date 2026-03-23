import routerLogsDash from "./routerLogsDash.cjs";
import routerStatusDash from "./routerStatusDash.cjs";

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
  app.use("/*name", checkHeaderMiddleware);
  return app;
}

module.exports = { logsDashboard, StatusDashboard, checkHeaderMiddleware };
