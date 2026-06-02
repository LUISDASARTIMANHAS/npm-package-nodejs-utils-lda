// @ts-nocheck
import { ChannelType, PermissionFlagsBits } from "discord.js";
import {
  getGuildByInteraction,
  getMemberByInteraction,
} from "./interactionGetters.mjs";
import { verifyBotPermission } from "./permissionValidators.mjs";

/**
 * @typedef {{ categoryId?: string, staffRoleId?: string, ticketType?: string }} TicketChannelOptions
 */

const openTickets = new Map();
const DEFAULT_TICKET_TYPE = "ticket";
const MAX_TICKET_TYPE_LENGTH = 12;
const MAX_TICKET_USERNAME_LENGTH = 10;

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
 * Normaliza uma parte do nome do ticket.
 * @param {string} value
 * @param {number} maxLength
 * @returns {string}
 */
export function sanitizeTicketNamePart(value, maxLength = 10) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .substring(0, maxLength)
    .replace(/^-+|-+$/g, "") || "user";
}

/**
 * Formata o nome do canal do ticket.
 * @param {string} ticketType
 * @param {string} username
 * @param {number} ticketNumber
 * @returns {string}
 */
export function formatTicketChannelName(ticketType, username, ticketNumber = 1) {
  const safeType = sanitizeTicketNamePart(ticketType || DEFAULT_TICKET_TYPE, MAX_TICKET_TYPE_LENGTH);
  const safeUsername = sanitizeTicketNamePart(username || "user", MAX_TICKET_USERNAME_LENGTH);
  const paddedNumber = String(ticketNumber).padStart(3, "0");
  return `${safeType}-${safeUsername}-${paddedNumber}`;
}

/**
 * Divide um customId de ticket em partes.
 * @param {string} customId
 * @returns {string[]}
 */
export function getTicketCustomIdParts(customId) {
  return String(customId || "").split(":");
}

/**
 * Interpreta o customId de criação de ticket.
 * @param {string} customId
 * @returns {{command:string,ticketType:string,categoryId:string|null,staffRoleId:string|null,logChannelId:string|null}}
 */
export function parseTicketCreateCustomId(customId) {
  const [command = "", ticketType = DEFAULT_TICKET_TYPE, categoryId = "none", staffRoleId = "none", logChannelId = "none"] = getTicketCustomIdParts(customId);
  return {
    command,
    ticketType: ticketType || DEFAULT_TICKET_TYPE,
    categoryId: categoryId !== "none" ? categoryId : null,
    staffRoleId: staffRoleId !== "none" ? staffRoleId : null,
    logChannelId: logChannelId !== "none" ? logChannelId : null,
  };
}

/**
 * Interpreta o customId de fechamento de ticket.
 * @param {string} customId
 * @returns {{command:string,ticketType:string,logChannelId:string|null}}
 */
export function parseTicketCloseCustomId(customId) {
  const [command = "", ticketType = DEFAULT_TICKET_TYPE, logChannelId = "none"] = getTicketCustomIdParts(customId);
  return {
    command,
    ticketType: ticketType || DEFAULT_TICKET_TYPE,
    logChannelId: logChannelId !== "none" ? logChannelId : null,
  };
}

/**
 * Cria um customId para criação de ticket.
 * @param {string} ticketType
 * @param {string|null} categoryId
 * @param {string|null} staffRoleId
 * @param {string|null} logChannelId
 * @returns {string}
 */
export function buildTicketCreateCustomId(ticketType, categoryId, staffRoleId, logChannelId) {
  return `create_ticket:${ticketType || DEFAULT_TICKET_TYPE}:${categoryId || "none"}:${staffRoleId || "none"}:${logChannelId || "none"}`;
}

/**
 * Cria um customId para fechamento de ticket.
 * @param {string} ticketType
 * @param {string|null} logChannelId
 * @returns {string}
 */
export function buildTicketCloseCustomId(ticketType, logChannelId) {
  return `close_ticket:${ticketType || DEFAULT_TICKET_TYPE}:${logChannelId || "none"}`;
}

/**
 * Formata o tópico do canal de ticket.
 * @param {string} ticketType
 * @param {string} userTag
 * @returns {string}
 */
export function formatTicketChannelTopic(ticketType, userTag) {
  return `[${ticketType.toUpperCase()}] Ticket de ${userTag} • Aberto em ${new Date().toLocaleString("pt-BR")}`;
}

/**
 * Nome padrão do tópico privado de staff.
 * @returns {string}
 */
export function getStaffDiscussionThreadName() {
  return "🔒 Discussão Privada - Staff";
}

/**
 * Retorna o próximo número sequencial para tickets do tipo informado.
 * @param {import("discord.js").Guild} guild
 * @param {string} [ticketType]
 * @returns {Promise<number>}
 */
export async function getNextTicketNumber(guild, ticketType = DEFAULT_TICKET_TYPE) {
  const prefix = `${sanitizeTicketNamePart(ticketType, MAX_TICKET_TYPE_LENGTH)}-`;
  const ticketChannels = guild.channels.cache.filter(
    (ch) => ch.isTextBased() && ch.name.startsWith(prefix),
  );

  if (ticketChannels.size === 0) return 1;

  const numbers = ticketChannels
    .map((ch) => {
      const match = ch.name.match(new RegExp(`^${prefix}.+-([0-9]+)$`));
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => n > 0);

  return numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
}

/**
 * Cria as permissões básicas para o canal de ticket.
 * @param {import("discord.js").ButtonInteraction} interaction
 * @param {string|null} staffRoleId
 * @returns {any[]}
 */
export function buildTicketPermissionOverwrites(interaction, staffRoleId) {
  const guild = getGuildByInteraction(interaction);
  const member = getMemberByInteraction(interaction);
  const botId = interaction.client?.user?.id;

  if (!guild || !member) return [];

  /** @type {any[]} */
  const overwrites = [
    {
      id: guild.id,
      deny: [PermissionFlagsBits.ViewChannel],
    },
    {
      id: member.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.AttachFiles,
      ],
    },
  ];

  if (botId) {
    overwrites.push({
      id: botId,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.AttachFiles,
      ],
    });
  }

  if (staffRoleId && guild.roles.cache.has(staffRoleId)) {
    overwrites.push({
      id: staffRoleId,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.AttachFiles,
      ],
    });
  }

  return overwrites;
}

/**
 * Cria um canal de ticket a partir de uma interaction
 * @param {import("discord.js").ButtonInteraction} interaction
 * @param {TicketChannelOptions} options
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

  const { categoryId, staffRoleId, ticketType = DEFAULT_TICKET_TYPE } = options;

  if (hasOpenTicket(member.id)) {
    await interaction.reply({
      content: "Você já possui um ticket aberto.",
      ephemeral: true,
    });
    return null;
  }

  const ticketNumber = await getNextTicketNumber(guild, ticketType);
  const channelName = formatTicketChannelName(
    ticketType,
    member.user?.username || member.id,
    ticketNumber,
  );

  const permissionOverwrites = /** @type {import("discord.js").PermissionOverwriteResolvable[]} */ buildTicketPermissionOverwrites(
    interaction,
    staffRoleId || null,
  );

  try {
    const channel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: categoryId && categoryId !== "none" ? categoryId : null,
      permissionOverwrites,
      topic: formatTicketChannelTopic(ticketType, member.user.tag),
    });

    registerTicket(member.id, channel.id);

    return channel;
  } catch (err) {
    console.error("[createTicketChannelFromInteraction]:", err);
    return null;
  }
}

/**
 * Cria um tópico privado para discussão de staff.
 * @param {import("discord.js").TextChannel} ticketChannel
 * @param {string} staffRoleId
 * @returns {Promise<import("discord.js").ThreadChannel|null>}
 */
export async function createStaffDiscussionThread(ticketChannel, staffRoleId) {
  if (!ticketChannel || !staffRoleId) return null;

  try {
    const thread = await ticketChannel.threads.create({
      name: "🔒 Discussão Privada - Staff",
      autoArchiveDuration: 60,
      type: ChannelType.PrivateThread,
    });

    const role = ticketChannel.guild?.roles.cache.get(staffRoleId);
    if (role) {
      await Promise.allSettled(
        [...role.members.values()].map((member) =>
          thread.members.add(member.id).catch(() => null),
        ),
      );
    }

    return thread;
  } catch (err) {
    console.error("[createStaffDiscussionThread]:", err);
    return null;
  }
}

/**
 * Fecha um ticket e remove o registro local.
 * @param {import("discord.js").Interaction} interaction
 */
/**
 * Fecha um ticket e remove o registro local.
 * @param {import("discord.js").ButtonInteraction} interaction
 */
export async function closeTicket(interaction) {
  try {
    await interaction.reply({
      content: "Fechando ticket...",
    });

    if (!interaction.channel) return;
    removeTicketByChannel(interaction.channel.id);

    setTimeout(() => {
      interaction.channel?.delete?.().catch(console.error);
    }, 3000);
  } catch (err) {
    console.error("[closeTicket]:", err);
  }
}