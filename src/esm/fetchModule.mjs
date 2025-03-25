import fetch from "node-fetch";
import setEmbed from "./discordEmbed.mjs";
import { pipeline } from "stream";
import { promisify } from "util";
import { fopen, fwrite } from "./autoFileSysModule.mjs";
const streamPipeline = promisify(pipeline);

const headersDefault = {
  "x-forwarded-proto": "https,http,http",
  "x-forwarded-port": "443,80,80",
  "accept-encoding": "gzip",
};

export function fetchDownloadStream(url, filePath, callback) {
  try {
    if (!url || !filePath || !callback) {
      throw new Error("NO ARGUMENTS TO FETCH! URL, FILEPATH OR CALLBACK IS NULL");
    }

    console.log("Iniciando download:", url);

    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Erro ao baixar: ${response.status} ${response.statusText}`);
        }

        const fileStream = fs.createWriteStream(filePath);
        return streamPipeline(response.body, fileStream);
      })
      .then(() => {
        console.log("Download concluído:", filePath);
        callback(null, filePath);
      })
      .catch(err => {
        console.error("Erro no download:", err);
        callback(err, null);
      });
  } catch (err) {
    console.error("FATAL ERROR:", err);
  }
}

export function fetchGet(url, header, callback) {
  try {
    if (!url || !callback) {
      throw new Error("NO ARGUMENTS TO FETCH! URL OR CALLBACK IS NULL");
    }
    const newHeaders = Object.assign(headersDefault, header);
    const requestOptions = {
      method: "GET",
      headers: newHeaders,
    };

    console.log("FETCH GET:", url);
    fetch(url, requestOptions)
      .then((response) => {
        console.log(
          "Status da resposta:",
          response.status,
          response.statusText
        );
        const contentType = response.headers.get("content-type");
        console.log("Tipo de conteúdo:", contentType);

        // Verifica se houve erro na resposta
        if (!response.ok) {
          return response.text().then((errorData) => {
            throw new Error(
              `Erro na resposta do servidor: ${JSON.stringify(
                errorData,
                null,
                2
              )}`
            );
          });
        }

        // Verifica o tipo de conteúdo retornado
        if (contentType && contentType.includes("application/json")) {
          // Se for JSON, retorna o JSON
          return response.json();
        } else {
          // Se não for JSON, retorna o conteúdo como texto
          return response.text();
        }
      })
      .then((data) => {
        console.log("FETCH GET RECEBIDO! OK 200");
        console.log("Dados recebidos:", data);
        callback(null, data);
      })
      .catch((error) => {
        console.error(`Erro ao fazer a requisição para ${url}: ${error}`);
        callback(error, null);
      });
  } catch (err) {
    console.error("FATAL ERROR: " + err);
  }
}

export function fetchPost(url, payload, header, callback) {
  try {
    if (!url || !payload || !callback) {
      throw new Error(
        "NO ARGUMENTS TO FETCH! URL OR PAYLOAD OR CALLBACK IS NULL"
      );
    }
    const defaultContentType = {
      "content-type": `application/json; charset=UTF-8`,
    };
    var newHeaders = headersDefault;
    newHeaders = Object.assign(headersDefault, header || defaultContentType);
    const requestOptions = {
      method: "POST",
      headers: newHeaders,
      body: payload,
    };

    if (newHeaders["content-type"] == "application/json; charset=UTF-8") {
      console.log("Convertendo payload para JSON!");
      requestOptions.body = JSON.stringify(payload);
    }

    console.log("FETCH POST", url);
    fetch(url, requestOptions)
      .then((response) => {
        console.log(
          "Status da resposta:",
          response.status,
          response.statusText
        );
        const contentType = response.headers.get("content-type");
        console.log("Tipo de conteúdo:", contentType);

        // Verifica se houve erro na resposta
        if (!response.ok) {
          return response.text().then((errorData) => {
            throw new Error(JSON.stringify(errorData, null, 2));
          });
        }

        // Verifica o tipo de conteúdo retornado
        if (contentType && contentType.includes("application/json")) {
          // Se for JSON, retorna o JSON
          return response.json();
        } else {
          // Se não for JSON, retorna o conteúdo como texto
          return response.text();
        }
      })
      .then((data) => {
        console.log("FETCH POST ENVIADO! OK 200");
        console.log("Dados recebidos:", data);
        callback(null, data);
      })
      .catch((error) => {
        console.error(`Erro ao fazer a requisição para ${url}: ${error}`);
        callback(error, null);
      });
  } catch (err) {
    console.error("FATAL ERROR: " + err);
  }
}

export function discordLogs(title, mensagem, footerText) {
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
      `Err: Not Found env file key DISCORD_LOGS_WEBHOOK_URL, Discord LOGS Disabled!`
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

function checkConfigIntegrity() {
  // obtem config.json
  const configs = fopen("config.json");
  // Verificar se a chave discordLogs existe antes de acessá-la
  if (!configs.discordLogs) {
    // Cria discordLogs caso não exista
    configs.discordLogs = {};
  }
  if (!configs.headersDefault) {
    // Cria headersDefault caso não exista
    configs.headersDefault = {};
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
