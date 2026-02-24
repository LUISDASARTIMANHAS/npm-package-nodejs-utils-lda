import { logError, log } from "../logger/index.cjs";

// ============================
// FUNÇÕES INTERNAS
// ============================

export function checkArgs(url, payload) {
  if (!url || !payload) {
    throw new Error("NO ARGUMENTS TO FETCH! URL OR CALLBACK IS NULL");
  }
}
export function buildHeaders(extraHeaders = {}, includeContentType = false) {
  const headersDefault = {
    "x-forwarded-proto": "https,http,http",
    "x-forwarded-port": "443,80,80",
    "accept-encoding": "gzip",
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

export function requestStatus(response) {
  const status = response.status;
  const contentType = response.headers.get("content-type");

  log(`Status da resposta: ${status} - ${response.statusText}`);
  log(`Tipo de conteúdo: ${contentType}`);
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
