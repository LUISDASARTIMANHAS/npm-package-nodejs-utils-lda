import { fopen, fwrite } from "./autoFileSysModule.mjs";
import { configExist } from "./utils.mjs";
import { config } from "dotenv";
config();

// Carregar variáveis
configExist();
checkConfigIntegrity();

function setCacheHeaders(req, res, next){
  const configs = fopen("config.json");
  if (req.headers["x-disable-cache"] === "true") {
    console.log(
      `🚫 Disabling cache for this request. ${req.method}:${req.path}`
    );
    res.set("Cache-Control", "no-store");
    return next();
  }

  // Cache de 1 hora
  const cacheTime = 60 * configs.cacheDurationInMinutes; // 1 hora em segundos
  console.log(
    `✅ Adding ${cacheTime} minutes Cache header. ${req.method}:${req.path}`
  );
  res.set("Cache-Control", `public, max-age=${cacheTime}`);
  res.set("Cache-time", cacheTime);

  next();
};

function checkConfigIntegrity() {
  // obtem config.json
  const configs = fopen("config.json");
  // verifica se blockedRoutes não existe
  if (!configs.cacheDurationInMinutes) {
    // caso não exista configura para uma rota padrão
    configs.cacheDurationInMinutes = 30;
    // salva novamente
    fwrite("config.json", configs);
  }
}

export default setCacheHeaders;
