const { getConfig } = require("../configHelper.cjs");
const { logError, log } = require("../logger/index.cjs");

// FUNÇÕES BASICAS MODULARES
function checkArgs(url, callback) {
  if (!url || !callback) {
    throw new Error(`NO ARGUMENTS TO FETCH! URL OR CALLBACK IS NULL! 
			URL: ${url}
			CALLBACK: ${callback}
			`);
  }
}

function buildHeaders(extraHeaders = {}, includeContentType = false) {
  const config = getConfig();
  const envAgent = process.env.SERVER_USER_AGENT;
  const headersDefault = {
    "x-forwarded-proto": "https,http,http",
    "x-forwarded-port": "443,80,80",
    "accept-encoding": "gzip",
    "User-Agent": envAgent || config.userAgent || "BACKEND NODE SERVER"
  };

  const defaultContentType = {
    "content-type": "application/json; charset=UTF-8",
  };

  // Constrói os headers finais, adicionando Content-Type se necessário
  return Object.assign(
    {},
    headersDefault,
    includeContentType ? defaultContentType : {},
    extraHeaders,
  );
}

function requestStatus(response) {
  const status = response.status;
  const contentType = response.headers.get("content-type");

  log(`Status da resposta: ${status} - ${response.statusText}`);
  log(`Tipo de conteúdo: ${contentType}`);
}

function parseFetchResponse(response) {
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

function requestError(response) {
  return response.text().then((errorData) => {
    throw new Error(JSON.stringify(errorData, null, 2));
  });
}

function onError(url, error, callback) {
  logError(`Erro ao fazer a requisição para ${url}: ${error}`);
  callback(error, null);
}

module.exports = {
  checkArgs,
  buildHeaders,
  parseFetchResponse,
  requestError,
  onError,
};
