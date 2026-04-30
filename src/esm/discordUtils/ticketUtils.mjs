import { ChannelType, PermissionFlagsBits } from "discord.js";
import {
  getGuildByInteraction,
  getMemberByInteraction,
} from "./interactionGetters.mjs";
import { verifyBotPermission } from "./permissionValidators.mjs";

const openTickets = new Map();

/**
 * @param {string} userId
 * @returns {boolean}
 */
export function hasOpenTicket(userId) {
  return openTickets.has(userId);
}

/**
 * @param {string} userId
 * @param {string} channelId
 */
export function registerTicket(userId, channelId) {
  openTickets.set(userId, channelId);
}

/**
 * Remove ticket pelo channelId
 * @param {string} channelId
 */
export function removeTicketByChannel(channelId) {
  for (const [userId, chId] of openTickets.entries()) {
    if (chId === channelId) {
      openTickets.delete(userId);
      break;
    }
  }
}

/**
 * Cria um canal de ticket a partir de uma interaction
 */
export async function createTicketChannelFromInteraction(
  interaction,
  options = {},
) {
  const guild = getGuildByInteraction(interaction);
  const member = getMemberByInteraction(interaction);

  if (!guild || !member) return null;

  if (
    await verifyBotPermission(interaction, PermissionFlagsBits.ManageChannels)
  )
    return null;

  const { categoryId, staffRoleId } = options;

  // ✔ AGORA CORRETO
  if (hasOpenTicket(member.id)) {
    await interaction.reply({
      content: "Você já possui um ticket aberto.",
      ephemeral: true,
    });
    return null;
  }

  const permissionOverwrites = [
    {
      id: guild.id,
      deny: [PermissionFlagsBits.ViewChannel],
    },
    {
      id: member.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
      ],
    },
    {
      id: interaction.client.user.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
      ],
    },
  ];

  if (staffRoleId && guild.roles.cache.has(staffRoleId)) {
    permissionOverwrites.push({
      id: staffRoleId,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
      ],
    });
  }

  try {
    const channel = await guild.channels.create({
      name: `ticket-${member.id}`,
      type: ChannelType.GuildText,
      parent: categoryId && categoryId !== "none" ? categoryId : null,
      permissionOverwrites,
    });

    // ✔ REGISTRA
    registerTicket(member.id, channel.id);

    return channel;
  } catch (err) {
    console.error("[createTicketChannelFromInteraction]:", err);
    return null;
  }
}

export async function closeTicket(interaction) {
  try {
    await interaction.reply({
      content: "Fechando ticket...",
    });

    removeTicketByChannel(interaction.channel.id);

    setTimeout(() => {
      interaction.channel.delete().catch(console.error);
    }, 3000);
  } catch (err) {
    console.error("[closeTicket]:", err);
  }
}
