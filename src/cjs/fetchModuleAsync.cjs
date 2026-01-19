const fetch = require("node-fetch").default;
const { parseFetchResponse } = require("./utils.cjs");
const setEmbed = require("./discordUtils/discordEmbed.cjs");
const { fopen, fwrite } = require("./autoFileSysModule.cjs");
const { configExist } = require("./configHelper.cjs");
const { log } = require("./logger/index.cjs");
const logPath = "server-requests.txt";
configExist();

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
    log(`Dados recebidos: ${JSON.stringify(result.data)}`, logPath);

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
    log(`Dados recebidos: ${JSON.stringify(result.data)}`, logPath);

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
    log(`Dados recebidos: ${JSON.stringify(result.data)}`, logPath);

    return result;
  } catch (error) {
    log(
      `Erro ao fazer fetchPostJsonAsync para ${url}: ${error.message}`,
      logPath
    );
    throw error;
  }
}

// FUNÇÕES BASICAS MODULARES
function checkArgs(url, payload) {
  if (!url || !payload) {
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
  fetchDownloadStreamAsync,
  fetchGetAsync,
  fetchPostAsync,
  fetchPostJsonAsync,
};
