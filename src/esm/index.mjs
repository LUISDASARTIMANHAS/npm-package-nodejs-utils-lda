import fs from "fs";

// Importar e reexportar dinamicamente
export * from "./autoFileSysModule.mjs";
export * from "./checkHeaderMiddleware.mjs";
export { default as sendMail } from "./emailModule.mjs";
export * from "./fetchModule.mjs";
export * from "./httpsSecurity.mjs";
export * from "./utils.mjs";
export * from "./userSystem.mjs";

// criando arquivos pre requisitos
// Verifica se o arquivo config.json existe
if (!fs.existsSync("config.json")) {
  // Se não existir, cria a pasta
  fs.mkdirSync("config.json");
}
// Verifica se o arquivo .env existe
if (!fs.existsSync(".env")) {
  // Se não existir, cria a pasta
  fs.mkdirSync(".env");
}
// Verifica se a pasta ./data existe
if (!fs.existsSync("./data")) {
  // Se não existir, cria a pasta
  fs.mkdirSync("./data");
}
