import { log } from "../logger/index.mjs";
import cors from "cors";
import { hsts } from "helmet";
import { getConfig, checkConfigValue } from "../configHelper.mjs";
const logPath = "httpsFirewall.log";

// checkConfigIntegrity();

checkConfigValue("ORIGIN", [
  "/^https://.+/",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);
checkConfigValue("METHODS", "GET,PUT,POST,DELETE");
checkConfigValue("ALLOWED_HEADERS", [
  "Content-Type",
  "Access-Control-Allow-Origin",
  "authorization",
  "id",
  "key",
  "urlParams",
  "cache-control",
  "X-Disable-Cache",
  "x-nonce",
  "x-signature",
  "x-timestamp",
  "x-ip-info",
]);
checkConfigValue("ALLOWED_USER_AGENTS", [
  "Mozilla",
  "Chrome",
  "Firefox",
  "custom/1.0",
  "Discordbot",
  "iPhone OS",
  "WordPress",
]);

checkConfigValue("BLOCKED_USER_AGENTS", [
  "CensysInspect",
  "Shodan",
  "curl",
  "python-requests",
  "nmap",
]);

async function httpsFirewall(req, res, next) {
  const userAgent = req.get("user-agent") || "";

  if (await checkUserAgent(req, res, userAgent)) return;

  const corsOptions = makeCorsOptions();
  const hstsOptions = makeHstsOptions();

  cors(corsOptions)(req, res, () => {
    helmet.hsts(hstsOptions)(req, res, next);
  });
}

async function checkUserAgent(req, res, userAgent) {
  const configs = getConfig();
  const { ALLOWED_USER_AGENTS, BLOCKED_USER_AGENTS } = configs;

  // Verifica se o User-Agent é permitido ou bloqueado
  const isAllowed = isUserAgentAllowed(userAgent, ALLOWED_USER_AGENTS);
  const isBlocked = isUserAgentBlocked(userAgent, BLOCKED_USER_AGENTS);

  if (!isAllowed || isBlocked) {
    logBlockedUserAgent(userAgent, req);
    res.status(403).send("User-Agent not authorized.");
    return true; // Bloqueado
  }
  return false; // Permitido
}

// FUNÇÕES BASICAS DE SUBPROCESSOS

function isUserAgentAllowed(userAgent, allowedAgents) {
  return allowedAgents.some((ua) => userAgent.includes(ua));
}

function isUserAgentBlocked(userAgent, blockedAgents) {
  return blockedAgents.some((blocked) => userAgent.includes(blocked));
}

function logBlockedUserAgent(userAgent, req) {
  log(
    `Blocked UA: '${userAgent}' | IP: ${req.ip} | URL: ${req.originalUrl}`,
    logPath,
  );
}

/**
 * Converte strings que representam regex em RegExp real.
 *
 * @param {string|string[]|RegExp|RegExp[]} origins
 * @returns {(string|RegExp)[]}
 */
function normalizeOrigins(origins) {
  const list = Array.isArray(origins) ? origins : [origins];

  return list.map((origin) => {
    if (origin instanceof RegExp) {
      return origin;
    }

    if (
      typeof origin === "string" &&
      origin.startsWith("/") &&
      origin.endsWith("/")
    ) {
      const pattern = origin.slice(1, -1);
      return new RegExp(pattern);
    }

    return origin;
  });
}

/**
 * Cria opções dinâmicas de CORS.
 *
 * @returns {import("cors").CorsOptions}
 */
function makeCorsOptions() {
  const configs = getConfig();
  const allowedOrigins = normalizeOrigins(configs.ORIGIN);

  return {
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      const isAllowed = allowedOrigins.some((allowedOrigin) => {
        if (allowedOrigin instanceof RegExp) {
          return allowedOrigin.test(origin);
        }

        return allowedOrigin === origin;
      });

      if (isAllowed) return callback(null, true);

      return callback(new Error(`CORS bloqueado para a origem: ${origin}`));
    },
    methods: configs.METHODS,
    allowedHeaders: configs.ALLOWED_HEADERS,
    optionsSuccessStatus: 204,
  };
}

function makeHstsOptions() {
  return {
    maxAge: 365 * 24 * 60 * 60,
    includeSubDomains: true,
    preload: true,
  };
}

export default httpsFirewall;
