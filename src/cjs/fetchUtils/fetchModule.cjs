const fetch = require("node-fetch").default;
const { configExist } = require("../configHelper.cjs");
const { log, logError } = require("../logger/index.cjs");
const { checkArgs, buildHeaders, onError, parseFetchResponse, requestError } = require("./fetchUtils.cjs");
const logPath = "server-requests.txt";
configExist();

/**
 * Faz o download de um arquivo e salva localmente
 * @param {string} url - URL do arquivo para download.
 * @param {function} callback - Função de retorno (err, filestream,return headers).
 */
function fetchDownloadStream(url, sendHeader, callback) {
  try {
    checkArgs(url, callback);

    const requestOptions = {
      method: "GET",
      headers: buildHeaders(sendHeader, true),
    };

    log("Download Iniciado.", logPath);
    fetch(url, requestOptions)
      .then(async (response) => {
        if (!(response.status === 200 || response.status === 206)) {
          const errText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errText}`);
        }

        // Seu log aqui, quando a resposta foi bem sucedida e recebemos o stream
        log("Download concluído.", logPath);

        const importantHeaders = {
          "content-length": response.headers.get("content-length"),
          "content-range": response.headers.get("content-range"),
          "accept-ranges": response.headers.get("accept-ranges"),
          "content-type": response.headers.get("content-type"),
        };

        callback(null, response.body, importantHeaders);
      })
      .catch((error) => {
        logError(`Erro na requisição fetch: ${error.message}`);
        callback(error, null);
      });
  } catch (err) {
    logError(`Erro fatal em fetchDownloadStream: ${err.message}`);
    callback(err, null);
  }
}

function fetchGet(url, sendHeader, callback) {
  try {
    checkArgs(url, callback);
    const requestOptions = {
      method: "GET",
      headers: buildHeaders(sendHeader),
    };

    log(`FETCH GET: ${url}`, logPath);
    fetch(url, requestOptions)
      .then((response) => {
        // Verifica se houve erro na resposta
        if (!response.ok) {
          // retorna a exceção
          return requestError(response);
        }
        return parseFetchResponse(response);
      })
      .then((data, status) => {
        data.status = status;
        log(`FETCH GET RECEBIDO! OK ${status}`, logPath);
        log(`Dados recebidos: ${JSON.stringify(data,null,2)}`, logPath);
        callback(null, data);
      })
      .catch((error) => {
        onError(url, error, callback);
      });
  } catch (err) {
    log("[fetchGet] FATAL ERROR: " + err);
  }
}

function fetchPostJson(url, payload, sendHeader, callback) {
  try {
    checkArgs(url, callback);

    const headers = buildHeaders(sendHeader, true);

    const requestOptions = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload),
    };

    log(`FETCH POST JSON ${url}`, logPath);
    fetch(url, requestOptions)
      .then((response) => {
        // Verifica se houve erro na resposta
        if (!response.ok) {
          // retorna a exceção
          return requestError(response);
        }

        return parseFetchResponse(response);
      })
      .then((data, status) => {
        data.status = status;
        log(`FETCH POST ENVIADO! OK ${status}`, logPath);
        log(`Dados recebidos: ${JSON.stringify(data,null,2)}`, logPath);
        callback(null, data);
      })
      .catch((error) => {
        onError(url, error, callback);
      });
  } catch (err) {
    logError("[fetchPostJson] FATAL ERROR: " + err);
  }
}

function fetchPost(url, payload, sendHeader, callback) {
  try {
    checkArgs(url, callback);

    const headers = buildHeaders(sendHeader, true);

    const requestOptions = {
      method: "POST",
      headers: headers,
      body: payload,
    };

    if (headers["content-type"] === "application/json; charset=UTF-8") {
      log("Convertendo payload para JSON!", logPath);
      requestOptions.body = JSON.stringify(payload);
    }

    log(`FETCH POST ${url}`, logPath);
    fetch(url, requestOptions)
      .then((response) => {
        // Verifica se houve erro na resposta
        if (!response.ok) {
          return requestError(response);
        }

        return parseFetchResponse(response);
      })
      .then((data, status) => {
        data.status = status;
        log(`FETCH POST ENVIADO! OK ${status}`, logPath);
        log(`Dados recebidos: ${JSON.stringify(data,null,2)}`, logPath);
        callback(null, data);
      })
      .catch((error) => {
        onError(url, error, callback);
      });
  } catch (err) {
    logError("[fetchPost] FATAL ERROR: " + err);
  }
}


module.exports = {
  fetchGet,
  fetchDownloadStream,
  fetchPost,
  fetchPostJson,
};
