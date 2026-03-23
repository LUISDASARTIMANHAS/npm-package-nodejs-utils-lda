const { log } = require("../logger/index.cjs");
const cors = require("cors");
const helmet = require("helmet");
const { getConfig, checkConfigValue } = require("../configHelper.cjs");
const logPath = "httpsFirewall.log";

// checkConfigIntegrity();

checkConfigValue("ORIGIN", ["/^https://.+/"]);
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
    if (req.method === "OPTIONS") {
      configureCorsHeaders(res, corsOptions);
    }
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

function configureCorsHeaders(res, corsOptions) {
  res.set("Access-Control-Allow-Origin", corsOptions.origin);
  res.set("Access-Control-Allow-Methods", corsOptions.methods);
  res.set("Access-Control-Allow-Headers", corsOptions.allowedHeaders);
}

function makeCorsOptions() {
  const configs = getConfig();
  return {
    origin: configs.ORIGIN,
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

// function checkConfigIntegrity() {
//   // obtem config.json
//   const configs = fopen("config.json");
//   if (!configs.ORIGIN) {
//     configs.ORIGIN = ["/^https://.+/"];
//   }
//   if (!configs.METHODS) {
//     configs.METHODS = "GET,PUT,POST,DELETE";
//   }
//   if (!configs.ALLOWED_HEADERS) {
//     configs.ALLOWED_HEADERS = [
//       "Content-Type",
//       "Access-Control-Allow-Origin",
//       "authorization",
//       "id",
//       "key",
//       "urlParams",
//       "cache-control",
//       "X-Disable-Cache",
//       "x-nonce",
//       "x-signature",
//       "x-timestamp",
//       "x-ip-info",
//     ];
//   }
//   if (!configs.ALLOWED_USER_AGENTS) {
//     configs.ALLOWED_USER_AGENTS = [
//       "Mozilla",
//       "Chrome",
//       "Firefox",
//       "custom/1.0",
//       "Discordbot",
//       "iPhone OS",
//       "WordPress"
//     ];
//   }
//   if (!configs.BLOCKED_USER_AGENTS) {
//     configs.BLOCKED_USER_AGENTS = [
//       "CensysInspect",
//       "Shodan",
//       "curl",
//       "python-requests",
//       "nmap",
//     ];
//   }

//   // salva novamente
//   fwrite("config.json", configs);
// }
module.exports = httpsFirewall;
