

export function StatusDashboard(mainRouter) {
  mainRouter.use("/", routerStatusDash);
  console.log("\n\t[npm-package-nodejs-utils-lda] [StatusDash] loaded!");
  return mainRouter;
}

export function checkHeaderMiddleware(app) {
  antiReplyMiddleware(app); // 🔥 primeiro (segurança)
  app.use(routerCheckHeaderMiddleware); // depois auth
  console.log("\n\t[npm-package-nodejs-utils-lda] [checkHeaderMiddleware] loaded!");
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
  rateLimitMiddleware(mainRouter);

  requestLoggerMiddleware(mainRouter);
  discordRequestLoggerMiddleware(mainRouter);
  cacheMiddleware(mainRouter)
  checkHeaderMiddleware(mainRouter);
  exposePublicFolder(mainRouter);
  logsDashboardMiddleWare(mainRouter);
  StatusDashboard(mainRouter);
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
