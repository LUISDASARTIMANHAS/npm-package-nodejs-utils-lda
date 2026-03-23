import routerLogsDash from "./routerLogsDash.mjs";
import routerStatusDash from "./routerStatusDash.mjs";

/**
 * Registra rota dinâmica para listagem e acesso aos logs
 * @param {import("express").Express} app
 * @returns {boolean}
 */
export function logsDashboard(mainRouter) {
  mainRouter.use("/logs", routerLogsDash);
  return mainRouter;
}

export function StatusDashboard(mainRouter) {
	mainRouter.use("/", routerStatusDash);
	return mainRouter;
}

export function checkHeaderMiddleware(app) {
	app.use("/", checkHeaderMiddleware);
	return app;
}
