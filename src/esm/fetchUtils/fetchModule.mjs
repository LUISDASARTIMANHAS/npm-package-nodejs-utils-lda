import fetch from "node-fetch";
import { log, logError } from "../logger/index.mjs";
import { buildHeaders, checkArgs, onError, parseFetchResponse, requestError, requestStatus } from "./fetchUtils.mjs";

const logPath = "server-requests.txt";

/**
 * Faz o download de um arquivo e salva localmente
 * @param {string} url - URL do arquivo para download.
 * @param {function} callback - Função de retorno (err, filestream).
 */
export function fetchDownloadStream(url,header, callback) {
  try {
    checkArgs(url, callback);
    const headers = buildHeaders(header);
    const requestOptions = {
      method: "GET",
      headers: headers,
    };
    log(`Iniciando download: ${url}`, logPath);

    fetch(url)
      .then((response) => {
        requestStatus(response);
        if (!response.ok) {
          // retorna a exceção
          return requestError(response);
        }

        log("Download concluído.", logPath);
        callback(null, response.body); // Retorna o stream do arquivo
      })
      .catch((error) => {
        onError(url, error, callback);
      });
  } catch (err) {
    logError("[fetchDownloadStream] FATAL ERROR:", err);
    callback(err, null);
  }
}

export function fetchGet(url, header, callback) {
  try {
    checkArgs(url, callback);
    const headers = buildHeaders(header);
    const requestOptions = {
      method: "GET",
      headers: headers,
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
      .then((data,status) => {
        data.status = status;
        log(`FETCH GET RECEBIDO! OK ${status}`, logPath);
        log(`Dados recebidos: ${data}`, logPath);
        callback(null, data);
      })
      .catch((error) => {
        onError(url, error, callback);
      });
  } catch (err) {
    logError("[fetchGet] FATAL ERROR: " + err);
  }
}

export function fetchPostJson(url, payload, header, callback) {
  try {
    checkArgs(url, callback);

    const headers = buildHeaders(header, true);

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
      .then((data,status) => {
        data.status = status;
        log(`FETCH POST ENVIADO! OK ${status}`, logPath);
        log(`Dados recebidos: ${data}`, logPath);
        callback(null, data);
      })
      .catch((error) => {
        onError(url, error, callback);
      });
  } catch (err) {
    logError("[fetchPostJson] FATAL ERROR: " + err);
  }
}


export function fetchPost(url, payload, header, callback) {
  try {
    checkArgs(url, callback);

    const headers = buildHeaders(header, true);

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
          // retorna a exceção
          return requestError(response);
        }

        return parseFetchResponse(response);
      })
      .then((data,status) => {
        data.status = status;
        log(`FETCH POST ENVIADO! OK ${status}`, logPath);
        log(`Dados recebidos: ${data}`, logPath);
        callback(null, data);
      })
      .catch((error) => {
        onError(url, error, callback);
      });
  } catch (err) {
    logError("[fetchPost] FATAL ERROR: " + err);
  }
}
