// esm\router\discordRequestLoggerMiddleware.mjs
import express from "express";
import { discordLogs } from "../discordUtils/discordSender.mjs";
import { checkConfigValue, getConfig } from "../configHelper.mjs";
const routerDiscordRequestLogger = express.Router();

checkConfigValue("discordRequestLogger", {
  enabled: true,
});

routerDiscordRequestLogger.use("/api", (req, res, next) => {
  const configs = getConfig();
  const start = Date.now();
  if (!configs.discordRequestLogger.enabled) return next();

  const userAgent = req.headers["user-agent"] || "Desconhecido";
  const ip =
    req.headers["x-forwarded-for"] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    "IP não detectado";
  const referer = req.headers["referer"] || "Sem referer";
  const origin = req.headers["origin"] || "Sem Origin";
  const title =
    res.statusCode >= 500
      ? "🔴 SERVER ERROR"
      : res.statusCode >= 400
        ? "🟠 CLIENT ERROR"
        : "🟢 HTTP REQUEST";
  const size = res.getHeader("content-length") || "-";

  res.once("finish", () => {
    discordLogs(
      title,
      `🌐 ${req.method} ${req.originalUrl}

				📊 Status: ${res.statusCode}

				⏱ Tempo: ${Date.now() - start} ms

				🌍 IP:
				${ip}

				🔗 Origin:
				${origin}

				📎 Referer:
				${referer}

				🖥 UA:
				${userAgent}

				📦 Resposta: ${size} bytes`,
    );
  });

  next();
});

export default routerDiscordRequestLogger;
