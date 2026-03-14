
import { PermissionsBitField } from "discord.js";
import { verifyBotPermission } from "./permissionValidators.mjs";

/**
 * Executa uma ação de moderação genérica.
 *
 * @param {import("discord.js").ChatInputCommandInteraction} interaction
 * @param {import("discord.js").User} targetUser
 * @param {Object} options
 * @param {bigint} options.permissionFlag
 * @param {string} options.actionName
 * @param {(member: import("discord.js").GuildMember) => Promise<void>} options.execute
 * @returns {Promise<boolean>}
 */
export async function executeModerationAction(interaction, targetUser, options) {
  const guild = getGuildByInteraction(interaction);
  const moderator = getMemberByInteraction(interaction);
  const executorUser = getUserByInteraction(interaction);

  if (!guild || !moderator) {
    await replyWarning(interaction, "Guild or member not found.");
    return false;
  }

  if (!targetUser) {
    await replyWarning(interaction, "Target user not defined.");
    return false;
  }

  if (executorUser.id === targetUser.id) {
    await replyWarning(interaction, `You cannot ${options.actionName} yourself.`);
    return false;
  }

  if (guild.ownerId === targetUser.id) {
    await replyWarning(interaction, `You cannot ${options.actionName} the server owner.`);
    return false;
  }

  if (await verifyBotPermission(interaction, options.permissionFlag)) {
    return false;
  }

  try {
    const member = await guild.members.fetch(targetUser.id);

    await options.execute(member);

    return true;
  } catch (error) {
    console.error(error);

    await replyWarning(
      interaction,
      `${options.actionName} failed: ${error.message}`,
    );

    return false;
  }
}

export async function banUser(interaction, targetUser, reason = "No reason provided") {

  return executeModerationAction(interaction, targetUser, {
    actionName: "ban",
    permissionFlag: PermissionsBitField.Flags.BanMembers,

    async execute(member) {
      if (!member.bannable) {
        throw new Error("User cannot be banned due to role hierarchy.");
      }

      await member.ban({ reason });
    }
  });
}

export async function kickUser(interaction, targetUser, reason = "No reason provided") {

  return executeModerationAction(interaction, targetUser, {
    actionName: "kick",
    permissionFlag: PermissionsBitField.Flags.KickMembers,

    async execute(member) {
      if (!member.kickable) {
        throw new Error("User cannot be kicked due to role hierarchy.");
      }

      await member.kick(reason);
    }
  });
}

export async function timeoutUser(interaction, targetUser, durationMs, reason = "No reason provided") {

  return executeModerationAction(interaction, targetUser, {
    actionName: "timeout",
    permissionFlag: PermissionsBitField.Flags.ModerateMembers,

    async execute(member) {
      await member.timeout(durationMs, reason);
    }
  });
}