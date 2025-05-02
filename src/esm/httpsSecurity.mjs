import { fopen, fwrite, log } from "./autoFileSysModule.mjs";
import cors from "cors";
import helmet from "helmet";
import { configExist } from "./utils.mjs";

configExist();
checkConfigIntegrity();

async function httpsSecurityMiddleware(req, res, next) {
  const configs = fopen("config.json");
  const userAgent = req.get("user-agent") || "";

  if (await checkUserAgent(req, res, userAgent)) return;

  const corsOptions = makeCorsOptions(configs);
  const hstsOptions = makeHstsOptions();

  cors(corsOptions)(req, res, () => {
    if (req.method === "OPTIONS") {
      configureCorsHeaders(res, corsOptions);
    }
    helmet.hsts(hstsOptions)(req, res, next);
  });
}

async function checkUserAgent(req, res, userAgent) {
  const configs = fopen("config.json");
  const { ALLOWED_USER_AGENTS, BLOCKED_USER_AGENTS } = configs;

  // Verifica se o User-Agent é permitido ou bloqueado
  const isAllowed = isUserAgentAllowed(userAgent, ALLOWED_USER_AGENTS);
  const isBlocked = isUserAgentBlocked(userAgent, BLOCKED_USER_AGENTS);

  if (!isAllowed || isBlocked) {
    logBlockedUserAgent(userAgent, req);
    res.status(403).send("User-Agent not authorized.");
    return true;  // Bloqueado
  }
  return false;  // Permitido
}

// FUNÇÕES BASICAS DE SUBPROCESSOS

function isUserAgentAllowed(userAgent, allowedAgents) {
  return allowedAgents.some(ua => userAgent.includes(ua));
}

function isUserAgentBlocked(userAgent, blockedAgents) {
  return blockedAgents.some(blocked => userAgent.includes(blocked));
}

function logBlockedUserAgent(userAgent, req) {
  log(`Blocked UA: '${userAgent}' | IP: ${req.ip} | URL: ${req.originalUrl}`,"UAfirewall.txt");
  console.warn(`Blocked UA: '${userAgent}' | IP: ${req.ip} | URL: ${req.originalUrl}`);
}

function configureCorsHeaders(res, corsOptions) {
  res.set("Access-Control-Allow-Origin", corsOptions.origin);
  res.set("Access-Control-Allow-Methods", corsOptions.methods);
  res.set("Access-Control-Allow-Headers", corsOptions.allowedHeaders);
}

function makeCorsOptions(configs) {
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

function checkConfigIntegrity() {
  // obtem config.json
  const configs = fopen("config.json");
  if (!configs.ORIGIN) {
    configs.ORIGIN = ["/^https://.+/"];
  }
  if (!configs.METHODS) {
    configs.METHODS = "GET,PUT,POST,DELETE";
  }
  if (!configs.ALLOWED_HEADERS) {
    configs.ALLOWED_HEADERS = [
      "Content-Type",
      "Access-Control-Allow-Origin",
      "authorization",
      "id",
      "key",
      "urlParams",
      "cache-control",
      "X-Disable-Cache",
    ];
  }
  if (!configs.ALLOWED_USER_AGENTS) {
    configs.ALLOWED_USER_AGENTS = [
      "Mozilla",
      "Chrome",
      "Firefox",
      "custom/1.0",
    ];
  }
  if (!configs.BLOCKED_USER_AGENTS) {
    configs.BLOCKED_USER_AGENTS = [
      "CensysInspect",
      "Shodan",
      "curl",
      "python-requests",
      "nmap",
    ];
  }

  // salva novamente
  fwrite("config.json", configs);
}

export default httpsSecurityMiddleware;