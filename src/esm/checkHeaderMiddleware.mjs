import { express } from "express";
import { forbidden, conversorSimEnao, sanitize } from "./utils.cjs";
import { fopen } from "./autoFileSysModule.cjs";
import xss from "xss";
const configs = fopen("config.json");
const routesDir = __dirname;
const rootDir = process.cwd();
const pages = routesDir + "/src/pages";
const css = routesDir + "/src/css";

if (!configs) {
  console.error(`Err: Not Found config.json!`)
    return null;
}

function checkHeaderMiddleware(app) {
  app.use(express.static(css));
  app.use(express.static(pages));
  // Middleware para configurar o tipo de conteúdo como JSON
  app.all("/api/*name", (req, res, next) => {
    if (!req.headers["authorization"]) {
      forbidden(
        res,
        "Autorização de acesso minima faltante para essa rota! authorization is null!"
      );
    }
    res.set("Content-Type", "application/json");
    next();
  });

  app.all("/*name", (req, res, next) => {
    const origin = req.headers.referer || req.headers.referrer;
    const keyHeader = req.headers["authorization"];
    const blockedRoutes = configs.blockedRoutes || [];
    const blockRoutesPresent = blockedRoutes.some((route) => {
      // Trata rotas com curingas
      const regex = new RegExp(`^${route.replace(/\*/g, ".*")}$`);
      return regex.test(req.path);
    });
    const payload = JSON.stringify(req.body, null, 2);
    const keys = ["ROOT:keyBypass"];
    const validKey = keys.some((key) => keyHeader === key);
    const auth = blockRoutesPresent && !validKey;

    console.log("-------------------------");
    console.log("SISTEMA <CHECK> <OBTER>: " + req.url);
    console.log("SISTEMA <ORIGEM>: " + origin);
    console.log("SISTEMA <PAYLOAD>: " + payload);

    for (const key in req.body) {
      const payloadValues = req.body[key];
      req.body[key] = xss(payloadValues);
      req.body[key] = sanitize(payloadValues);
    }
    if (auth) {
      // Se estiver solicitando das rotas bloqueadas E não conter key, bloquea a solicitação
      forbidden(
        res,
        "Autorização de acesso minima faltante para essa rota bloqueada. Minimum access authorization missing for this blocked route."
      );
    } else {
      // Cabeçalho "solicitador" presente ou rota não bloqueada, permite o acesso
      print(keyHeader, validKey, auth);
      next();
    }
  });
}

// functions basicas
function print(keyHeader, key, auth) {
  console.log("SISTEMA <VERIFICAÇÃO>: " + keyHeader + " == " + key);
  console.log("SISTEMA <AUTORIZAÇÃO>: " + conversorSimEnao(!auth));
  console.log("----------------------------");
}

export default checkHeaderMiddleware;