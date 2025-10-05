// interactionGetters.js
import { ChannelType } from "discord.js";

/* -----------------------------
	 GUILD GETTERS
----------------------------- */

/**
 * Obtém a guilda (servidor) da interação.
 * @param {import("discord.js").Interaction} interaction
 * @returns {import("discord.js").Guild|null}
 */
export function getGuildByInteraction(interaction) {
  return interaction.guild ?? null;
}

/**
 * Obtém o ID da guilda.
 * @param {import("discord.js").Interaction} interaction
 * @returns {string|null}
 */
export function getGuildIdByInteraction(interaction) {
  return interaction.guildId ?? null;
}

/**
 * Obtém o nome da guilda.
 * @param {import("discord.js").Interaction} interaction
 * @returns {string|null}
 */
export function getGuildNameByInteraction(interaction) {
  return interaction.guild?.name ?? null;
}

/* -----------------------------
	 CHANNEL GETTERS
----------------------------- */

/**
 * Obtém o canal da interação.
 * @param {import("discord.js").Interaction} interaction
 * @returns {import("discord.js").Channel|null}
 */
export function getChannelFromInteraction(interaction) {
  return interaction.channel ?? null;
}

/**
 * Obtém o ID do canal.
 * @param {import("discord.js").Interaction} interaction
 * @returns {string|null}
 */
export function getChannelIdByInteraction(interaction) {
  return interaction.channelId ?? null;
}

/**
 * Obtém o nome do canal.
 * @param {import("discord.js").Interaction} interaction
 * @returns {string|null}
 */
export function getChannelNameByInteraction(interaction) {
  return interaction.channel?.name ?? null;
}

/* -----------------------------
	 USER / MEMBER GETTERS
----------------------------- */

/**
 * Obtém o usuário que realizou a interação.
 * @param {import("discord.js").Interaction} interaction
 * @returns {import("discord.js").User|null}
 */
export function getUserByInteraction(interaction) {
  return interaction.user ?? interaction.member?.user ?? null;
}

/**
 * Obtém o ID do usuário.
 * @param {import("discord.js").Interaction} interaction
 * @returns {string|null}
 */
export function getUserIdByInteraction(interaction) {
  return interaction.user?.id ?? interaction.member?.user?.id ?? null;
}

/**
 * Obtém o membro (GuildMember) da interação.
 * @param {import("discord.js").Interaction} interaction
 * @returns {import("discord.js").GuildMember|null}
 */
export function getMemberByInteraction(interaction) {
  return interaction.member ?? null;
}

/**
 * Obtém os cargos do membro.
 * @param {import("discord.js").Interaction} interaction
 * @returns {import("discord.js").Role[]|null}
 */
export function getMemberRolesByInteraction(interaction) {
  return interaction.member?.roles?.cache
    ? [...interaction.member.roles.cache.values()]
    : null;
}

/* -----------------------------
	 COMMAND GETTERS
----------------------------- */

/**
 * Obtém o nome do comando (Slash Command).
 * @param {import("discord.js").Interaction} interaction
 * @returns {string|null}
 */
export function getCommandNameByInteraction(interaction) {
  return interaction.isCommand?.() || interaction.isChatInputCommand?.()
    ? interaction.commandName
    : null;
}

/**
 * Obtém o subcomando (se existir).
 * @param {import("discord.js").Interaction} interaction
 * @returns {string|null}
 */
export function getSubcommandByInteraction(interaction) {
  if (interaction.isChatInputCommand?.()) {
    try {
      return interaction.options.getSubcommand(false) ?? null;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Obtém todas as opções do comando.
 * @param {import("discord.js").Interaction} interaction
 * @returns {import("discord.js").CommandInteractionOptionResolver|null}
 */
export function getOptionsByInteraction(interaction) {
  return interaction.options ?? null;
}

/* -----------------------------
	 METADATA GETTERS
----------------------------- */

/**
 * Obtém o tipo da interação.
 * @param {import("discord.js").Interaction} interaction
 * @returns {string}
 */
export function getInteractionType(interaction) {
  return interaction.type;
}

/**
 * Obtém o ID da interação.
 * @param {import("discord.js").Interaction} interaction
 * @returns {string}
 */
export function getInteractionId(interaction) {
  return interaction.id;
}

/**
 * Obtém o token da interação.
 * @param {import("discord.js").Interaction} interaction
 * @returns {string}
 */
export function getInteractionToken(interaction) {
  return interaction.token;
}

/**
 * Obtém o timestamp de criação da interação.
 * @param {import("discord.js").Interaction} interaction
 * @returns {number}
 */
export function getCreatedTimestamp(interaction) {
  return interaction.createdTimestamp;
}

/**
 * Verifica se a interação aconteceu em DM.
 * @param {import("discord.js").Interaction} interaction
 * @returns {boolean}
 */
export function isDM(interaction) {
  return (
    interaction.guild === null || interaction.channel?.type === ChannelType.DM
  );
}

/* -----------------------------
	 SUMMARY GETTER
----------------------------- */

/**
 * Retorna um resumo completo da interação (útil para logs/debug).
 * @param {import("discord.js").Interaction} interaction
 * @returns {object}
 */
export function getInteractionSummary(interaction) {
  return {
    guildId: getGuildIdByInteraction(interaction),
    guildName: getGuildNameByInteraction(interaction),
    channelId: getChannelIdByInteraction(interaction),
    channelName: getChannelNameByInteraction(interaction),
    userId: getUserIdByInteraction(interaction),
    userTag: interaction.user?.tag ?? null,
    memberRoles: getMemberRolesByInteraction(interaction),
    command: getCommandNameByInteraction(interaction),
    subcommand: getSubcommandByInteraction(interaction),
    options: getOptionsByInteraction(interaction),
    isDM: isDM(interaction),
    type: getInteractionType(interaction),
    createdAt: new Date(getCreatedTimestamp(interaction)).toISOString(),
    interactionId: getInteractionId(interaction),
    token: getInteractionToken(interaction),
  };
}
