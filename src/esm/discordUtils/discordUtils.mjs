import { ChannelType, PermissionsBitField, ActivityType } from "discord.js";
import { getGuildByInteraction } from "./interactionGetters.mjs";

/**
 * Retorna o número de usuários que o bot consegue ver.
 * @param {import("discord.js").Client} bot - Instância do cliente Discord
 * @returns {number} Número total de usuários
 */
export function getUsersCount(bot) {
  // Soma de todos os membros nos servidores que o bot consegue acessar
  return bot.guilds.cache.reduce(
    (total, guild) => total + guild.memberCount,
    0
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
	const guild = getGuildByInteraction(interaction)
  if (!guild) {
    return null; // Sem guild, não tem permissões
  }
  return guild.members.me?.permissions ?? null;
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
