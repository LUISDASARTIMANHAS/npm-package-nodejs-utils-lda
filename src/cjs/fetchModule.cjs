const fetch = require("node-fetch").default;
const { configExist } = require("./configHelper.cjs");
const setEmbed = require("./discordUtils/discordEmbed.cjs");
const { fopen, fwrite, log } = require("./autoFileSysModule.cjs");
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
      headers: buildHeaders(sendHeader,true),
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
        console.error(`Erro na requisição fetch: ${error.message}`);
        callback(error, null);
      });
  } catch (err) {
    console.error(`Erro fatal em fetchDownloadStream: ${err.message}`);
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
        log(`Dados recebidos: ${data}`, logPath);
        callback(null, data);
      })
      .catch((error) => {
        onError(url, error, callback);
      });
  } catch (err) {
    console.error("FATAL ERROR: " + err);
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
        log(`Dados recebidos: ${data}`, logPath);
        callback(null, data);
      })
      .catch((error) => {
        onError(url, error, callback);
      });
  } catch (err) {
    console.error("FATAL ERROR: " + err);
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
        log(`Dados recebidos: ${data}`, logPath);
        callback(null, data);
      })
      .catch((error) => {
        onError(url, error, callback);
      });
  } catch (err) {
    console.error("FATAL ERROR: " + err);
  }
}

function discordLogs(title, mensagem, footerText) {
  checkConfigIntegrity();
  const configs = fopen("config.json").discordLogs;
  const date = new Date();
  const ano = date.getFullYear();
  const webhookUrl = process.env.DISCORD_LOGS_WEBHOOK_URL;
  const preSet = {
    content: "",
    embeds: [
      setEmbed(
        title,
        mensagem,
        configs.color,
        footerText || configs.footerText,
        configs.footerUrl
      ),
    ],
    attachments: [],
  };
  let altWebhookUrl;

  if (webhookUrl == null || webhookUrl == "") {
    console.error(
      `[npm-package-nodejs-utils-lda] WARN: Not Found env file key DISCORD_LOGS_WEBHOOK_URL, Discord LOGS Disabled!`
    );
    return null;
  } else {
    altWebhookUrl = webhookUrl;
  }
  fetchPost(altWebhookUrl, preSet, null, (error, data) => {
    if (error) {
      console.error(error);
    }
  });
}

// FUNÇÕES BASICAS MODULARES
function checkArgs(url, callback) {
  if (!url || !callback) {
    throw new Error("NO ARGUMENTS TO FETCH! URL OR CALLBACK IS NULL");
  }
}

function buildHeaders(extraHeaders = {}, includeContentType = false) {
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
    extraHeaders
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
  console.error(`Erro ao fazer a requisição para ${url}: ${error}`);
  callback(error, null);
}

function checkConfigIntegrity() {
  // obtem config.json
  const configs = fopen("config.json");
  // Verificar se a chave emailSystem existe antes de acessá-la
  if (!configs.discordLogs) {
    // Cria discordLogs caso não exista
    configs.discordLogs = {};
  }
  const discordLogsConfig = configs.discordLogs;

  // Verificar e atribuir valores padrão, se necessário
  if (
    !discordLogsConfig.color ||
    !discordLogsConfig.footerText ||
    !discordLogsConfig.footerUrl
  ) {
    configs.discordLogs.color = configs.discordLogs.color || "FF00FF";
    configs.discordLogs.footerText = configs.discordLogs.footerText || null;
    configs.discordLogs.footerUrl =
      configs.discordLogs.footerUrl ||
      "https://cdn.discordapp.com/attachments/952004420265205810/1188643212378787940/pingobras-logo-fundo.png?ex=6682a481&is=66815301&hm=cc9c387ac2aad7fa8040738f47ae0ab43e2b77027d188e272a147b1829e3a53f&";
    // salva novamente
    fwrite("config.json", configs);
  }
}

module.exports = {
  fetchGet,
  fetchDownloadStream,
  fetchPost,
  fetchPostJson,
  discordLogs
};
