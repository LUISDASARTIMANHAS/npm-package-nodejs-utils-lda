const express = require("express");

function setupRoutes(req, res, next) {
  const router = express.Router();

  // Rota de status
  router.get("/status", (req, res) => {
    res.json({ status: "OK", timestamp: new Date() });
  });

  // Rota de debug
  router.get("/debug", (req, res) => {
    res.json({ message: "Debug Information", timestamp: new Date() });
  });

  // Rota blackhole para lidar com muitas requisições
  router.use("/blackhole", (req, res) => {
    res.status(429);
    res.send("Too Many Requests // Muitas Solicitações!");
  });

  // Usar o router para registrar as rotas
  // Isso invoca o router e permite que ele manipule as requisições
  router(req, res, next);
}

module.exports = setupRoutes;
