import { replyWarning } from "./discordUtils.mjs";
import { getGuildByInteraction } from "./interactionGetters.mjs";
import { PermissionsBitField } from "discord.js";

const PermissionNames = Object.fromEntries(
  Object.entries(PermissionsBitField.Flags).map(([k, v]) => [v, k]),
);

/**
 * Converte um permission flag para o nome da permissão.
 *
 * @param {bigint} permissionFlag
 * @returns {string}
 */
export function getPermissionName(permissionFlag) {
  const name = PermissionNames[permissionFlag];

  if (!name) return "Unknown Permission";

  return name
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Obtém as permissões atuais do bot dentro de uma interação.
 *
 * @param {import("discord.js").Interaction} interaction
 * @returns {import("discord.js").PermissionsBitField | null}
 */
export function getBotPermissionsByInteraction(interaction) {
  const guild = getGuildByInteraction(interaction);

  if (!guild) return null;

  return guild.members.me?.permissions ?? null;
}

/**
 * Verifica se o bot possui uma permissão específica na guild.
 *
 * @param {import("discord.js").Interaction} interaction
 * @param {bigint} permissionFlag
 * @returns {Promise<boolean>} true se NÃO possui permissão
 */
export async function verifyBotPermission(interaction, permissionFlag) {
  const botPermissions = getBotPermissionsByInteraction(interaction);
  const permissionName = getPermissionName(permissionFlag);

  if (!botPermissions || !botPermissions.has(permissionFlag)) {
    await replyWarning(
      interaction,
      `Bot does not have ${permissionName} required permission.`,
    );
    return true;
  }

  console.log(`[verifyBotPermission]: ${permissionName} permission granted!`);
  return false;
}

export const verifyManageMessagesInInteraction = (interaction) =>
  verifyBotPermission(interaction, PermissionsBitField.Flags.ManageMessages);

export const verifyBanInInteraction = (interaction) =>
  verifyBotPermission(interaction, PermissionsBitField.Flags.BanMembers);