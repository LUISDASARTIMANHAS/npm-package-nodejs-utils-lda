const express = require("express");
const path = require("path");
const fs = require("fs");
const { httpInternalServerError } = require("../router/exceptionAPI.cjs");
const routerDefault = express.Router();
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

module.exports = routerDefault;