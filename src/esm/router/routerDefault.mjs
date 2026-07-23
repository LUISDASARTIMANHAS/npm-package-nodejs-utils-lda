import { Router } from "express";
import { join } from "path";
import { promises } from "fs";
import { httpForbidden, httpInternalServerError } from "./exceptionAPI.mjs";
const routerDefault = Router();
const LOGS_DIR = "logs";

function registerDefaultRoutes(app) {
  app.get("/routes", (req, res) => {
    const stack = app.router?.stack ?? app._router?.stack ?? [];

    res.json(getRoutes(stack));
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

export default registerDefaultRoutes;
