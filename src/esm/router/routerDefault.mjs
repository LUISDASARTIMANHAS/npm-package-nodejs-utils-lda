import { Router } from "express";
import { join } from "path";
import { promises } from "fs";
import { httpForbidden, httpInternalServerError } from "./exceptionAPI.mjs";
const routerDefault = Router();
const LOGS_DIR = "logs";

routerDefault.get("/routes", async (req, res) => {
  const listRoutes = router.stack
    .filter((r) => r.route && r.route.path)
    .map((r) => {
      const methods = Object.keys(r.route.methods).join(", ").toUpperCase();
      return { path: r.route.path, methods };
    });
  res.status(200).json(listRoutes);
});

export default routerDefault;