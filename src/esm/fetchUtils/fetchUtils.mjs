import { checkConfigValue, getConfig } from "../configHelper.mjs";
import { logError, log } from "../logger/index.mjs";
const logPath = "server-requests.txt";

// ============================
// FUNÇÕES INTERNAS
// ============================
checkConfigValue("userAgent","BACKEND NODE SERVER");

export function checkArgs(url, callback) {
  if (!url || !callback) {
    throw new Error(`NO ARGUMENTS TO FETCH! URL OR CALLBACK IS NULL! 
			URL: ${url}
			CALLBACK: ${callback}
			`);
  }
}
export function buildHeaders(extraHeaders = {}, includeContentType = false) {
  const config = getConfig();
  const envAgent = process.env.SERVER_USER_AGENT;
  const defaultServerAgent = envAgent || config.userAgent || "BACKEND NODE SERVER"
  const headersDefault = {
    "x-forwarded-proto": "https,http,http",
    "x-forwarded-port": "443,80,80",
    "accept-encoding": "gzip",
    "User-Agent": defaultServerAgent
  };

  const defaultContentType = {
    "content-type": "application/json; charset=UTF-8",
  };

  // Constrói os headers finais, adicionando Content-Type se necessário
  const headers = Object.assign(
    {},
    headersDefault,
    includeContentType ? defaultContentType : {},
    extraHeaders,
  );
  log(`The server is using the headers ${JSON.stringify(headers,null,2)}`,logPath,300);
  return headers;
}

export function requestStatus(response) {
  const status = response.status;
  const contentType = response.headers.get("content-type");

  log(`Status da resposta: ${status} - ${response.statusText}`,logPath);
  log(`Tipo de conteúdo: ${contentType}`,logPath);
}

export function parseFetchResponse(response) {
  const status = response.status;
  const contentType = response.headers.get("content-type");

  requestStatus(response);

  // Verifica o tipo de conteúdo retornado
  if (contentType && contentType.includes("application/json")) {
    // Se for JSON, retorna o JSON
    return response.json().then((data) => ({ data, status }));
  } else {
    // Se não for JSON, retorna o conteúdo como texto
    return response.text().then((data) => ({ data, status }));
  }
}

export function requestError(response) {
  return response.text().then((errorData) => {
    throw new Error(JSON.stringify(errorData, null, 2));
  });
}

export function onError(url, error, callback) {
  logError(`Erro ao fazer a requisição para ${url}: ${error}`);
  callback(error, null);
}
