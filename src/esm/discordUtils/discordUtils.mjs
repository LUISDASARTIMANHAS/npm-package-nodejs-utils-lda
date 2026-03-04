import { ChannelType, PermissionsBitField, ActivityType } from "discord.js";
import { getGuildByInteraction } from "./interactionGetters.mjs";
import { fileExistAndCreate } from "../utils.mjs";

/**
 * Retorna o número de usuários que o bot consegue ver.
 * @param {import("discord.js").Client} bot - Instância do cliente Discord
 * @returns {number} Número total de usuários
 */
export function getUsersCount(bot) {
  // Soma de todos os membros nos servidores que o bot consegue acessar
  return bot.guilds.cache.reduce(
    (total, guild) => total + guild.memberCount,
    0,
  );
}

/**
 * Retorna o número de canais que o bot consegue ver.
 * @param {import("discord.js").Client} bot - Instância do cliente Discord
 * @returns {number} Número total de canais
 */
export function getChannelsCount(bot) {
  return bot.channels.cache.size;
}

/**
 * Retorna o número de servidores em que o bot está.
 * @param {import("discord.js").Client} bot - Instância do cliente Discord
 * @returns {number} Número total de servidores
 */
export function getGuildsCount(bot) {
  return bot.guilds.cache.size;
}

/**
 * Retorna a tag do bot (nome#1234)
 * @param {import("discord.js").Client} bot - Instância do cliente Discord
 * @returns {string} Tag do bot
 */
export function getBotTag(bot) {
  return bot.user?.tag ?? "Desconhecido#0000";
}

/**
 * Obtém as permissões atuais do bot dentro de uma interação.
 *
 * @param {import("discord.js").Interaction} interaction - Objeto da interação recebida do Discord.
 * @returns {import("discord.js").PermissionsBitField} Retorna as permissões atuais do bot no servidor.
 */
export function getBotPermissionsByInteraction(interaction) {
  const guild = getGuildByInteraction(interaction);
  if (!guild) {
    return null; // Sem guild, não tem permissões
  }
  return guild.members.me?.permissions ?? null;
}

/**
 * Renderiza uma string substituindo ${variavel}
 * @param {string} template
 * @param {Object} variables
 * @returns {string}
 */
export function renderTemplate(template, variables) {
  return template.replace(/\$\{(.*?)\}/g, (_, key) => {
    return variables[key.trim()] ?? "";
  });
}

/**
 * Altera o status do bot de forma aleatória entre diferentes atividades e tipos.
 *
 * @param {import("discord.js").Client} bot - Instância do cliente Discord.
 * @param {string} configs.descricao - Descrição do bot.
 * @returns {void} Atualiza o status do bot e loga informações no console.
 */
export function changeStatus(bot) {
  const statusFile = "./data/status.json";
  const ActivitiesFile = "./data/Activities.json";
  fileExistAndCreate(statusFile, {
    description: "Ausente",
    typeStatus: "idle",
  });
  fileExistAndCreate(ActivitiesFile, [
    "${guildsCount} servers!",
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
  const atividades = fopen(ActivitiesFile);
  const description = configs.description || "Status";
  const status = configs.typeStatus || "idle";
  const dataTime = date.toLocaleString("pt-BR");
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
    {
      name: randomActivity,
      type: ActivityType.Streaming,
      url: "https://twitch.tv",
    },
    { name: randomActivity, type: ActivityType.Watching },
    { name: `${dataTime}`, type: ActivityType.Watching },
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

/**
 * Verifica se o bot possui a permissão "ManageMessages" no servidor.
 * Caso contrário, responde com um aviso ao usuário.
 *
 * @param {import("discord.js").Interaction} interaction - Objeto da interação recebida do Discord.
 * @returns {Promise<void>} Retorna uma Promise que resolve quando a verificação termina.
 */

export async function verifyManageMessagesInInteraction(interaction) {
  const botPermissions = getBotPermissionsByInteraction(interaction);

  if (
    !botPermissions ||
    !botPermissions.has(PermissionsBitField.Flags.ManageMessages)
  ) {
    await replyWarning(
      interaction,
      `I don't have permissions to manage messages!
      Não tenho permissões de gerenciar mensagens!`,
      false,
    );
    // not verifyManageMessagesInInteraction
    return true;
  }
  console.log("[verifyManageMessagesInInteraction]: permission granted!");
  return false;
}

/**
 * Verifica se a interação está ocorrendo em um canal de servidor válido.
 * Caso seja em DM ou o canal seja indefinido, retorna uma resposta e false.
 *
 * @param {import("discord.js").Interaction} interaction - Objeto da interação do Discord.
 * @returns {Promise<boolean | void>} Retorna false se for em DM, ou void se o canal for válido.
 */
export async function validateInteractionChannel(interaction) {
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
 * Envia uma mensagem de aviso para o usuário dentro da interação.
 *
 * @param {import("discord.js").Interaction} interaction - Objeto da interação onde a resposta será enviada.
 * @param {string} message - Mensagem de aviso a ser exibida.
 * @param {boolean} [isPrivate=true] - Define se a resposta será visível apenas para o autor da interação.
 * @returns {Promise<void>} Retorna uma Promise que resolve quando a resposta for enviada.
 */

export async function replyWarning(interaction, message, isPrivate = true) {
  if (interaction.replied || interaction.deferred) return;

  await interaction.reply({
    content: `:warning: ${message}`,
    flags: isPrivate ? 64 : 0, // 64 = EPHEMERAL
  });
}
