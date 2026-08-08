const express = require("express");
const path = require("path");
const fs = require("fs");
const { httpInternalServerError } = require("../exceptionAPI.cjs");
const { fopen } = require("../../autoFileSysModule.cjs");
const routerDefault = express.Router();
const LOGS_DIR = "logs";

function registerDefaultRoutes(app) {
  app.get("/routes", (req, res) => {
    const stack = app.router?.stack ?? app._router?.stack ?? [];

    res.json(getRoutes(stack));
  });

  app.get("/headers", (req, res) => {
    res.json(req.headers);
  });

  app.get("/request", (req, res) => {
    res.json({
      method: req.method,
      url: req.originalUrl,
      protocol: req.protocol,
      secure: req.secure,
      ip: req.ip,
      ips: req.ips,
      hostname: req.hostname,
      headers: req.headers,
      query: req.query,
      params: req.params,
    });
  });

  app.get("/health", (req, res) => {
    res.json({
      status: "UP",
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/ip", (req, res) => {
    res.json({
      ip: req.ip,
      ips: req.ips,
      remoteAddress: req.socket.remoteAddress,
    });
  });

  app.get("/version", async (req, res) => {
    try {
      const packageJson = fopen("package.json");

      res.json({
        name: packageJson.name,
        version: packageJson.version,
      });
    } catch {
      httpInternalServerError(
        res,
        "Não foi possível obter a versão da aplicação.",
      );
    }
  });

  app.get("/time", (req, res) => {
    const now = new Date();

    res.json({
      timestamp: now.getTime(),
      iso: now.toISOString(),
      locale: now.toLocaleString(),
    });
  });
}

function getRoutes(stack, prefix = "") {
  const routes = [];

  for (const layer of stack) {
    // Rota normal
    if (layer.route) {
      routes.push({
        path: prefix + layer.route.path,
        methods: Object.keys(layer.route.methods).map((m) => m.toUpperCase()),
      });
    }

    // Router aninhado
    if (layer.handle?.stack) {
      routes.push(...getRoutes(layer.handle.stack, prefix));
    }
  }

  return routes;
}

function defaultRoutesMiddleware(app) {
  registerDefaultRoutes(app);
  console.log("\n\t[npm-package-nodejs-utils-lda] [DEFAULT ROUTES] loaded!");
  return app;
}

module.exports = defaultRoutesMiddleware;