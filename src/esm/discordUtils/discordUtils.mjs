// @ts-check

// src/esm/discordUtils/discordUtils.mjs

import { REST } from "@discordjs/rest";
import { ActivityType, Routes } from "discord.js";
import os from "node:os";

import { isDM } from "./interactionGetters.mjs";
import { replyInteraction } from "./interactionResponses.mjs";

import { shell, fileExistAndCreate, getRandomInt } from "../utils.mjs";

import { fopen, fwrite } from "../autoFileSysModule.mjs";

// ============================================================
// EXPORTS
// ============================================================

export * from "./defaultCommands/setStatus.mjs";
export * from "./defaultCommands/exec.mjs";
export * from "./defaultCommands/nslookup.mjs";
export * from "./defaultCommands/tracert.mjs";
export * from "./defaultCommands/curl.mjs";
export * from "./defaultCommands/ping.mjs";
export * from "./defaultCommands/status.mjs";

export * from "./ticketUtils.mjs";
export * from "./discordEmbed.mjs";
export * from "./interactionResponses.mjs";

export * from "./helpers/selectMenuHelper.mjs";
export * from "./helpers/containerHelper.mjs";
export * from "./helpers/modalHelper.mjs";
export * from "./helpers/buttonHelper.mjs";

// ============================================================
// ERROR HANDLING
// ============================================================

/**
 * Extrai informações de um erro, incluindo suas causas internas.
 *
 * @param {unknown} error - Erro original.
 * @returns {{ code: string | null, status: number | null, message: string }}
 */
function getErrorDetails(error) {
  /** @type {unknown[]} */
  const pending = [error];

  const visited = new Set();

  let code = null;
  let status = null;
  let message = error instanceof Error ? error.message : String(error);

  while (pending.length > 0) {
    const current = pending.shift();

    if (!current || typeof current !== "object" || visited.has(current)) {
      continue;
    }

    visited.add(current);

    const item = /** @type {Record<string, unknown>} */ (current);

    if (code === null && item.code !== undefined) {
      if (typeof item.code === "string" || typeof item.code === "number") {
        code = String(item.code);
      }
    }

    if (status === null && typeof item.status === "number") {
      status = item.status;
    }

    if (status === null && typeof item.statusCode === "number") {
      status = item.statusCode;
    }

    if (typeof item.message === "string" && item.message.length > 0) {
      message = item.message;
    }

    if (item.cause) {
      pending.push(item.cause);
    }

    if (item.rawError) {
      pending.push(item.rawError);
    }
  }

  return { code, status, message };
}

/**
 * Identifica erros de autenticação ou autorização.
 *
 * @param {unknown} error - Erro da API.
 * @returns {boolean}
 */
function isAuthenticationError(error) {
  const { status, code } = getErrorDetails(error);

  return status === 401 || status === 403 || code === "401" || code === "403";
}

/**
 * Identifica falhas de conexão potencialmente temporárias.
 *
 * @param {unknown} error - Erro da requisição.
 * @returns {boolean}
 */
function isRetryableConnectionError(error) {
  const retryableCodes = new Set([
    "UND_ERR_CONNECT_TIMEOUT",
    "UND_ERR_HEADERS_TIMEOUT",
    "UND_ERR_BODY_TIMEOUT",
    "UND_ERR_SOCKET",
    "UND_ERR_ABORTED",
    "ECONNRESET",
    "ECONNREFUSED",
    "ECONNABORTED",
    "ETIMEDOUT",
    "EAI_AGAIN",
    "ENETUNREACH",
    "EHOSTUNREACH",
    "EPIPE",
  ]);

  /** @type {unknown[]} */
  const pending = [error];

  const visited = new Set();

  while (pending.length > 0) {
    const current = pending.shift();

    if (!current || typeof current !== "object" || visited.has(current)) {
      continue;
    }

    visited.add(current);

    const item = /** @type {Record<string, unknown>} */ (current);

    if (typeof item.code === "string" && retryableCodes.has(item.code)) {
      return true;
    }

    if (
      typeof item.status === "number" &&
      (item.status === 429 || item.status >= 500)
    ) {
      return true;
    }

    if (item.cause) {
      pending.push(item.cause);
    }

    if (item.rawError) {
      pending.push(item.rawError);
    }
  }

  return false;
}

/**
 * Aguarda um intervalo.
 *
 * @param {number} ms - Tempo em milissegundos.
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================
// BOT INFORMATION
// ============================================================

/**
 * Retorna o número de usuários contabilizados nos servidores.
 *
 * @param {import("discord.js").Client} bot - Cliente Discord.
 * @returns {number}
 */
export function getUsersCount(bot) {
  return bot.guilds.cache.reduce(
    (total, guild) => total + guild.memberCount,
    0,
  );
}

/**
 * Retorna o número de canais presentes no cache.
 *
 * @param {import("discord.js").Client} bot - Cliente Discord.
 * @returns {number}
 */
export function getChannelsCount(bot) {
  return bot.channels.cache.size;
}

/**
 * Retorna o número de servidores presentes no cache.
 *
 * @param {import("discord.js").Client} bot - Cliente Discord.
 * @returns {number}
 */
export function getGuildsCount(bot) {
  return bot.guilds.cache.size;
}

/**
 * Retorna a tag do bot.
 *
 * @param {import("discord.js").Client} bot - Cliente Discord.
 * @returns {string}
 */
export function getBotTag(bot) {
  return bot.user?.tag ?? "Desconhecido#0000";
}

// ============================================================
// TEMPLATE ENGINE
// ============================================================

/**
 * Substitui placeholders ${variavel} pelos valores fornecidos.
 *
 * @param {string} template - Template original.
 * @param {Record<string, unknown>} variables - Variáveis disponíveis.
 * @returns {string}
 */
export function renderTemplate(template, variables) {
  if (typeof template !== "string") {
    throw new TypeError("Template deve ser uma string.");
  }

  if (!variables || typeof variables !== "object" || Array.isArray(variables)) {
    throw new TypeError("Variables deve ser um objeto.");
  }

  if (template.length > 100_000) {
    throw new RangeError("Template muito grande.");
  }

  return template.replace(/\$\{([^}]*)\}/g, (_, key) => {
    const value = variables[key.trim()];

    if (value === null || value === undefined) {
      return "";
    }

    return String(value);
  });
}

// ============================================================
// BOT STATUS
// ============================================================

/**
 * Atualiza aleatoriamente a atividade e o status do bot.
 *
 * @param {import("discord.js").Client} bot - Cliente Discord.
 * @returns {void}
 */
export function changeStatus(bot) {
  if (!bot.user) {
    console.warn("[LDA STATUS] O bot ainda não está autenticado.");
    return;
  }

  const statusFile = "./data/status.json";
  const activitiesFile = "./data/Activities.json";

  fileExistAndCreate(statusFile, {
    description: "Ausente",
    typeStatus: "idle",
  });

  fileExistAndCreate(ActivitiesFile, [
    "${guildsCount} servers!",
    "${hostname} - ${ping} ms",
    "${description} - ${ano}",
    "${channelsCount} channels!",
    "${description} - ${ano}",
    "${usersCount} users!",
    "${description} - ${ano}",
  ]);
  const date = new Date();
  const ano = date.getFullYear();
  const guildsCount = getGuildsCount(bot);
  const channelsCount = getChannelsCount(bot);
  const usersCount = getUsersCount(bot);
  const botTag = getBotTag(bot);
  const configs = fopen(statusFile);
  const atividades = fopen(activitiesFile);
  const description = configs.description || "Status";
  const status = configs.typeStatus || "idle";
  const dataTime = date.toLocaleString("pt-BR");
  const hostname = os.hostname();
  const ping = Math.round(bot.ws.ping || 0);
  // Seleciona uma atividade aleatória
  const rawActivity = atividades[getRandomInt(atividades.length)];

  // Variáveis disponíveis para o template
  const variables = {
    guildsCount,
    channelsCount,
    usersCount,
    description,
    ano,
    dataTime,
    ping,
  };
  // Seleciona uma atividade aleatória
  const randomActivity = renderTemplate(rawActivity, variables);

  // Define possíveis tipos de status
  const statusOptions = [
    { name: randomActivity, type: ActivityType.Competing },
    { name: `${description}`, type: ActivityType.Custom },
    { name: randomActivity, type: ActivityType.Listening },
    { name: `${dataTime}`, type: ActivityType.Listening },
    { name: randomActivity, type: ActivityType.Playing },
    { name: `${dataTime}`, type: ActivityType.Playing },
    { name: `${ping} ms`, type: ActivityType.Playing },
    {
      name: randomActivity,
      type: ActivityType.Streaming,
      url: "https://twitch.tv",
    },
    { name: randomActivity, type: ActivityType.Watching },
    { name: `${dataTime}`, type: ActivityType.Watching },
    { name: `${hostname}`, type: ActivityType.Watching },
  ];
  const statusOptionsLength = statusOptions.length;
  const randomOption = getRandomInt(statusOptionsLength);

  // Seleciona um status aleatório
  const randomStatus = statusOptions[randomOption];

  // Atualiza status do bot
  bot.user.setActivity(randomStatus);
  bot.user.setStatus(status);

  // Loga informações
  console.log(`${botTag} DISCORD STATUS`);
  console.log(`Status Activity: ${status} - ${randomActivity}`);
}

// ============================================================
// INTERACTION HANDLING
// ============================================================

/**
 * Identifica uma interação inexistente ou expirada.
 *
 * Não confunde falhas de conexão com interações expiradas.
 *
 * @param {unknown} error - Erro da interação.
 * @returns {boolean}
 */
function isInteractionUnavailable(error) {
  const { code } = getErrorDetails(error);

  return code === "10062" || code === "UNKNOWN_INTERACTION";
}

/**
 * Confirma uma interação antes de executar operações demoradas.
 *
 * @param {import("discord.js").Interaction} interaction - Interação Discord.
 * @returns {Promise<boolean>}
 */
export async function discordAwaitReply(interaction) {
  if (!interaction) {
    throw new TypeError("interaction não foi fornecida.");
  }

  if (interaction.deferred || interaction.replied) {
    return true;
  }

  try {
    await interaction.deferReply();
    return true;
  } catch (error) {
    const details = getErrorDetails(error);

    if (isInteractionUnavailable(error)) {
      console.warn("[LDA INTERACTION] Interação inexistente ou expirada.");
      return false;
    }

    if (
      details.code === "40060" ||
      details.code === "INTERACTION_ALREADY_REPLIED"
    ) {
      console.warn("[LDA INTERACTION] A interação já foi confirmada.");
      return true;
    }

    // Timeouts de rede não são tratados como expiração.
    throw error;
  }
}

/**
 * Valida o canal da interação.
 *
 * @param {import("discord.js").Interaction} interaction - Interação Discord.
 * @returns {Promise<boolean>}
 */

export async function validateInteractionChannel(interaction) {
  // ACK IMEDIATO
  const ok = await discordAwaitReply(interaction);

  if (!ok) {
    return true;
  }

  if (isDM(interaction)) {
    await replyWarning(
      interaction,
      `It is not permitted to use commands in DM. Find a server to use this command.
      Não é permitido usar comandos em DM. Procure um servidor para usar esse comando.`,
    );
    // isDM
    return true;
  }
  console.log("[validateInteractionChannel]: server channel granted!");
  return false;
}

/**
 * Envia uma mensagem de aviso pela interação.
 *
 * @param {import("discord.js").Interaction} interaction - Interação Discord.
 * @param {string} message - Mensagem de aviso.
 * @param {boolean} [isPrivate=true] - Define a visibilidade da resposta.
 * @returns {Promise<void>}
 */
export async function replyWarning(interaction, message, isPrivate = true) {
  const payload = {
    content: `⚠️ ${message}`,
    flags: isPrivate ? 64 : 0,
  };

  try {
    await replyInteraction(interaction, payload);
  } catch (error) {
    const details = getErrorDetails(error);

    if (
      isInteractionUnavailable(error) ||
      details.code === "40060" ||
      details.code === "INTERACTION_ALREADY_REPLIED"
    ) {
      console.warn(
        "[LDA INTERACTION] Não foi possível enviar o aviso: interação indisponível.",
      );
      return;
    }

    throw error;
  }
}

// ============================================================
// MESSAGE CHUNKING
// ============================================================

/**
 * Divide o conteúdo em partes com tamanho máximo definido.
 *
 * @param {string} content - Conteúdo original.
 * @param {number} [maxLength=2000] - Tamanho máximo de cada parte.
 * @returns {string[]}
 */
function splitContent(content, maxLength = 2000) {
  if (!Number.isInteger(maxLength) || maxLength < 1) {
    throw new RangeError("maxLength precisa ser um inteiro positivo.");
  }

  const chunks = [];

  for (let index = 0; index < content.length; index += maxLength) {
    chunks.push(content.slice(index, index + maxLength));
  }

  return chunks.length > 0 ? chunks : [""];
}

/**
 * Atualiza a resposta e envia partes adicionais.
 *
 * @param {import("discord.js").Interaction} interaction - Interação Discord.
 * @param {string} content - Conteúdo da resposta.
 * @returns {Promise<void>}
 */
async function editReplyWithChunks(interaction, content) {
  const chunks = splitContent(String(content));

  await interaction.editReply({
    content: chunks.shift(),
  });

  for (const chunk of chunks) {
    await interaction.followUp({
      content: chunk,
    });
  }
}

// ============================================================
// COMMAND EXECUTION
// ============================================================

/**
 * Executa um comando usando o módulo shell existente.
 *
 * ATENÇÃO: execCommand e parameters devem ser controlados e validados
 * pelo chamador. Não passe argumentos arbitrários de usuários.
 *
 * @param {import("discord.js").Interaction} interaction - Interação Discord.
 * @param {string} execCommand - Comando permitido.
 * @param {string} [parameters=""] - Parâmetros do comando.
 * @returns {Promise<void>}
 */
export async function discordHandleExecTemplate(
  interaction,
  execCommand,
  parameters = "",
) {
  try {
    const ok = await discordAwaitReply(interaction);

    if (!ok) {
      return;
    }

    const command = `${execCommand} ${parameters || ""}`.trim();

    await interaction.editReply({
      content: [`⏳ Executando: ${command}`, `⏳ Executing: ${command}`].join(
        "\n",
      ),
    });

    const resultado = await shell(command);

    const resultPrefix = `🖥️ ${command}:\n\`\`\`\n`;
    const resultSuffix = "\n```";

    const resultChunkLength = Math.max(
      1,
      2000 - resultPrefix.length - resultSuffix.length,
    );

    const resultChunks = splitContent(String(resultado), resultChunkLength);

    await interaction.editReply({
      content: `${resultPrefix}${resultChunks.shift()}${resultSuffix}`,
    });

    for (const chunk of resultChunks) {
      await interaction.followUp({
        content: `${resultPrefix}${chunk}${resultSuffix}`,
      });
    }
  } catch (error) {
    const details = getErrorDetails(error);

    console.error("[LDA EXEC] Falha na execução.", {
      code: details.code,
      status: details.status,
      message: details.message,
    });

    try {
      if (!interaction.replied && !interaction.deferred) {
        return;
      }

      await editReplyWithChunks(
        interaction,
        [
          "⚠️ Erro ao executar o comando.",
          "⚠️ Error while executing the command.",
          "",
          `\`\`\`\n${details.message}\n\`\`\``,
        ].join("\n"),
      );
    } catch (replyError) {
      console.error(
        "[LDA EXEC] Não foi possível enviar a resposta de erro.",
        getErrorDetails(replyError),
      );
    }
  }
}

// ============================================================
// SLASH COMMAND SYNCHRONIZATION
// ============================================================

const MAX_SYNC_ATTEMPTS = 4;

/** @type {boolean} */
let syncInProgress = false;

/** @type {ReturnType<typeof setTimeout> | null} */
let syncRetryTimer = null;

/**
 * Sincroniza os comandos globais da aplicação.
 *
 * @param {any[]} commands - Comandos serializados do Discord.
 * @param {string} token - Token do bot.
 * @param {string} applicationId - ID da aplicação.
 * @returns {Promise<void>}
 */
async function sendSlashCommands(commands, token, applicationId) {
  const rest = new REST({
    version: "10",
    timeout: 60_000,
    retries: 2,
  }).setToken(token);

  console.log(
    `[LDA SYNC] Iniciando sincronização de ${commands.length} comandos globais.`,
  );

  for (let attempt = 1; attempt <= MAX_SYNC_ATTEMPTS; attempt++) {
    try {
      await rest.put(Routes.applicationCommands(applicationId), {
        body: commands,
      });

      console.log(
        `[LDA SYNC] ${commands.length} comandos sincronizados com sucesso.`,
      );

      return;
    } catch (error) {
      const details = getErrorDetails(error);

      console.error("[LDA SYNC] Falha na requisição.", {
        attempt,
        maxAttempts: MAX_SYNC_ATTEMPTS,
        code: details.code,
        status: details.status,
        message: details.message,
      });

      if (isAuthenticationError(error)) {
        console.error(
          "[LDA SYNC] Falha de autenticação. Verifique o token e o ID da aplicação.",
        );

        throw error;
      }

      const retryable =
        isRetryableConnectionError(error) ||
        details.status === 429 ||
        (details.status !== null && details.status >= 500);

      if (!retryable || attempt === MAX_SYNC_ATTEMPTS) {
        throw error;
      }

      const delay = Math.min(2_000 * 2 ** (attempt - 1), 8_000);

      console.warn(`[LDA SYNC] Nova tentativa em ${delay / 1_000}s.`);

      await sleep(delay);
    }
  }
}

/**
 * Agenda nova sincronização sem duplicar temporizadores.
 *
 * @param {any[]} commands - Comandos a sincronizar.
 * @param {string} token - Token do bot.
 * @param {string} applicationId - ID da aplicação.
 * @param {number} restartSec - Intervalo antes da nova tentativa.
 * @returns {void}
 */
function scheduleCommandsSyncRetry(commands, token, applicationId, restartSec) {
  if (syncRetryTimer !== null) {
    return;
  }

  const delaySeconds =
    Number.isFinite(restartSec) && restartSec > 0 ? restartSec : 20;

  console.warn(`[LDA SYNC] Nova tentativa agendada em ${delaySeconds}s.`);

  syncRetryTimer = setTimeout(() => {
    syncRetryTimer = null;

    void commandsSYNC(commands, token, applicationId, delaySeconds);
  }, delaySeconds * 1_000);
}

/**
 * Ponto público de sincronização dos comandos slash.
 *
 * @param {any[]} commands - Comandos registrados pelo bot.
 * @param {string} [token] - Token do bot.
 * @param {string} [CLIENT_ID] - ID da aplicação.
 * @param {number} [restartSec=20] - Intervalo entre ciclos de sincronização.
 * @returns {Promise<void>}
 */
export async function commandsSYNC(
  commands,
  token = process.env.DISCORD_BOT_TOKEN,
  CLIENT_ID = process.env.DISCORD_BOT_CLIENT_ID,
  restartSec = 20,
) {
  if (
    typeof token !== "string" ||
    !token.trim() ||
    typeof CLIENT_ID !== "string" ||
    !/^\d{17,20}$/.test(CLIENT_ID)
  ) {
    console.error(
      "[LDA SYNC] DISCORD_BOT_TOKEN ou DISCORD_BOT_CLIENT_ID inválido.",
    );

    return;
  }

  if (!Array.isArray(commands)) {
    throw new TypeError("[LDA SYNC] commands precisa ser um array.");
  }

  if (commands.length > 100) {
    throw new RangeError(
      "[LDA SYNC] A aplicação não pode ter mais de 100 comandos globais.",
    );
  }

  if (syncInProgress) {
    console.warn("[LDA SYNC] Já existe uma sincronização em andamento.");

    return;
  }

  syncInProgress = true;

  try {
    try {
      await fwrite("./src/commands.backup.json", commands);
    } catch (error) {
      console.warn(
        "[LDA SYNC] Não foi possível salvar o backup dos comandos.",
        getErrorDetails(error),
      );
    }

    await sendSlashCommands(commands, token, CLIENT_ID);
  } catch (error) {
    const details = getErrorDetails(error);

    console.error("[LDA SYNC] Sincronização não concluída.", {
      code: details.code,
      status: details.status,
      message: details.message,
    });

    if (isAuthenticationError(error)) {
      console.error(
        "[LDA SYNC] Corrija as credenciais antes de tentar novamente.",
      );

      return;
    }

    scheduleCommandsSyncRetry(commands, token, CLIENT_ID, restartSec);
  } finally {
    syncInProgress = false;
  }
}
