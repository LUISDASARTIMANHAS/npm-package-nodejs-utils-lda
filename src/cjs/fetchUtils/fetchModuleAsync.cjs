const fetch = require("node-fetch").default;
const { configExist } = require("../configHelper.cjs");
const { log } = require("../logger/index.cjs");
const logPath = "server-requests.txt";
configExist();
const { checkArgs, buildHeaders, onError, parseFetchResponse, requestError } = require("./fetchUtils.cjs");
/**
 * Faz o download de um arquivo e salva localmente
 * @param {string} url - URL do arquivo para download.
 * @param {object} sendHeader - {authorization:"a", content-type:"a", etc...}.
 */
async function fetchDownloadStreamAsync(url, sendHeader = {}) {
  try {
    checkArgs(url, true)
    const requestOptions = {
      method: "GET",
      headers: buildHeaders(sendHeader, true),
    };
    log("Download Iniciado.", logPath);
    const response = await fetch(url, requestOptions);

    if (!(response.status === 200 || response.status === 206)) {
      const errText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errText}`);
    }

    log("Download concluído.", logPath);

    const importantHeaders = {
      "content-length": response.headers.get("content-length"),
      "content-range": response.headers.get("content-range"),
      "accept-ranges": response.headers.get("accept-ranges"),
      "content-type": response.headers.get("content-type"),
    };

    return { stream: response.body, headers: importantHeaders };
  } catch (error) {
    log(`Erro na requisição fetch: ${error.message}`, logPath);
    throw error;
  }
}

async function fetchGetAsync(url, sendHeader = {}) {
  try {
    checkArgs(url,true)
    const requestOptions = {
      method: "GET",
      headers: buildHeaders(sendHeader),
    };

    log(`FETCH GET: ${url}`, logPath);

    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }

    const result = await parseFetchResponse(response);

    log(`FETCH GET RECEBIDO! OK ${result.status}`, logPath);
    log(`Dados recebidos: ${JSON.stringify(result.data,null,2)}`, logPath);

    return result;
  } catch (error) {
    log(`Erro ao fazer fetchGetAsync para ${url}: ${error.message}`, logPath);
    throw error;
  }
}


async function fetchPostAsync(url, payload, sendHeader = {}) {
  try {
    checkArgs(url, payload)
    const headers = buildHeaders(sendHeader, true);

    const requestOptions = {
      method: "POST",
      headers: headers,
      body:
        headers["content-type"] === "application/json; charset=UTF-8"
          ? JSON.stringify(payload)
          : payload,
    };

    log(`FETCH POST ${url}`, logPath);

    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }

    const result = await parseFetchResponse(response);

    log(`FETCH POST ENVIADO! OK ${result.status}`, logPath);
    log(`Dados recebidos: ${JSON.stringify(result.data,null,2)}`, logPath);

    return result;
  } catch (error) {
    log(`Erro ao fazer fetchPostAsync para ${url}: ${error.message}`, logPath);
    throw error;
  }
}

async function fetchPostJsonAsync(url, payload, sendHeader = {}) {
  try {
    checkArgs(url, payload)
    const headers = buildHeaders(sendHeader, true);

    const requestOptions = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload),
    };

    log(`FETCH POST JSON ${url}`, logPath);

    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }

    const result = await parseFetchResponse(response);

    log(`FETCH POST JSON ENVIADO! OK ${result.status}`, logPath);
    log(`Dados recebidos: ${JSON.stringify(result.data,null,2)}`, logPath);

    return result;
  } catch (error) {
    log(
      `Erro ao fazer fetchPostJsonAsync para ${url}: ${error.message}`,
      logPath
    );
    throw error;
  }
}


module.exports = {
  fetchDownloadStreamAsync,
  fetchGetAsync,
  fetchPostAsync,
  fetchPostJsonAsync,
};
