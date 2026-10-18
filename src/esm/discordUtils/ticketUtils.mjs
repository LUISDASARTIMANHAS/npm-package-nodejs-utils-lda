
 // src/esm/discordUtils/ticketUtils.mjs
// @ts-nocheck

import { ChannelType, PermissionFlagsBits } from "discord.js";
import {
  getGuildByInteraction,
  getMemberByInteraction,
} from "./interactionGetters.mjs";
import { verifyBotPermission } from "./permissionValidators.mjs";
import { log, logError } from "../logger/index.mjs";

/**
 * @typedef {{
 *   categoryId?: string,
 *   staffRoleId?: string,
 *   ticketType?: string
 * }} TicketChannelOptions
 */

const openTickets = new Map();

const DEFAULT_TICKET_TYPE = "ticket";
const MAX_TICKET_TYPE_LENGTH = 12;
const MAX_TICKET_USERNAME_LENGTH = 10;

/**
 * Verifica se o usuário possui um ticket registrado.
 * @param {string} userId
 * @returns {boolean}
 */
export function hasOpenTicket(userId) {
  return openTickets.has(userId);
}

/**
 * Registra um ticket aberto.
 * @param {string} userId
 * @param {string} channelId
 */
export function registerTicket(userId, channelId) {
  openTickets.set(userId, channelId);
}

/**
 * Remove o registro de um ticket pelo ID do canal.
 * @param {string} channelId
 */
export function removeTicketByChannel(channelId) {
  for (const [userId, registeredChannelId] of openTickets.entries()) {
    if (registeredChannelId === channelId) {
      openTickets.delete(userId);
      return true;
    }
  }

  return false;
}

/**
 * Normaliza uma parte do nome do ticket.
 * @param {string} value
 * @param {number} maxLength
 * @returns {string}
 */
export function sanitizeTicketNamePart(value, maxLength = 10) {
  return (
    String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .substring(0, maxLength)
      .replace(/^-+|-+$/g, "") || "user"
  );
}

/**
 * Formata o nome do canal do ticket.
 * @param {string} ticketType
 * @param {string} username
 * @param {number} ticketNumber
 * @returns {string}
 */
export function formatTicketChannelName(
  ticketType,
  username,
  ticketNumber = 1,
) {
  const safeType = sanitizeTicketNamePart(
    ticketType || DEFAULT_TICKET_TYPE,
    MAX_TICKET_TYPE_LENGTH,
  );

  const safeUsername = sanitizeTicketNamePart(
    username || "user",
    MAX_TICKET_USERNAME_LENGTH,
  );

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
 * @returns {{
 *   command: string,
 *   ticketType: string,
 *   categoryId: string|null,
 *   staffRoleId: string|null,
 *   logChannelId: string|null
 * }}
 */
export function parseTicketCreateCustomId(customId) {
  const [
    command = "",
    ticketType = DEFAULT_TICKET_TYPE,
    categoryId = "none",
    staffRoleId = "none",
    logChannelId = "none",
  ] = getTicketCustomIdParts(customId);

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
 * @returns {{
 *   command: string,
 *   ticketType: string,
 *   logChannelId: string|null
 * }}
 */
export function parseTicketCloseCustomId(customId) {
  const [
    command = "",
    ticketType = DEFAULT_TICKET_TYPE,
    logChannelId = "none",
  ] = getTicketCustomIdParts(customId);

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
export function buildTicketCreateCustomId(
  ticketType,
  categoryId,
  staffRoleId,
  logChannelId,
) {
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
  const safeType = String(ticketType || DEFAULT_TICKET_TYPE).toUpperCase();
  const safeUserTag = String(userTag || "usuário");

  return `[${safeType}] Ticket de ${safeUserTag} • Aberto em ${new Date().toLocaleString("pt-BR")}`;
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
export async function getNextTicketNumber(
  guild,
  ticketType = DEFAULT_TICKET_TYPE,
) {
  const prefix = `${sanitizeTicketNamePart(ticketType, MAX_TICKET_TYPE_LENGTH)}-`;

  const ticketChannels = guild.channels.cache.filter(
    (channel) =>
      channel.type === ChannelType.GuildText &&
      channel.name.startsWith(prefix),
  );

  if (ticketChannels.size === 0) {
    return 1;
  }

  const numbers = ticketChannels
    .map((channel) => {
      const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const match = channel.name.match(
        new RegExp(`^${escapedPrefix}.+-([0-9]+)$`),
      );

      return match ? Number.parseInt(match[1], 10) : 0;
    })
    .filter((number) => number > 0);

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

  if (!guild || !member) {
    return [];
  }

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
        PermissionFlagsBits.ManageChannels,
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
 * Cria um canal de ticket a partir de uma interaction.
 * @param {import("discord.js").ButtonInteraction} interaction
 * @param {TicketChannelOptions} options
 * @returns {Promise<import("discord.js").TextChannel|null>}
 */
export async function createTicketChannelFromInteraction(
  interaction,
  options = {},
) {
  const guild = getGuildByInteraction(interaction);
  const member = getMemberByInteraction(interaction);

  if (!guild || !member) {
    console.warn("[ticketUtils] Guild ou membro não encontrado.");
    return null;
  }

  try {
    const lacksPermission = await verifyBotPermission(
      interaction,
      PermissionFlagsBits.ManageChannels,
    );

    if (lacksPermission) {
      console.warn(
        "[ticketUtils] O bot não possui a permissão ManageChannels.",
      );
      return null;
    }
  } catch (error) {
    console.error("[ticketUtils] Erro ao verificar permissões:", error);
    return null;
  }

  const {
    categoryId,
    staffRoleId,
    ticketType = DEFAULT_TICKET_TYPE,
  } = options;

  // Não responder à interaction aqui: o ticketSystem controla a resposta.
  if (hasOpenTicket(member.id)) {
    console.warn(
      `[ticketUtils] O usuário ${member.id} já possui um ticket registrado.`,
    );
    return null;
  }

  try {
    const ticketNumber = await getNextTicketNumber(guild, ticketType);

    const channelName = formatTicketChannelName(
      ticketType,
      member.user?.username || member.id,
      ticketNumber,
    );

    const permissionOverwrites =
      /** @type {import("discord.js").PermissionOverwriteResolvable[]} */ (
        buildTicketPermissionOverwrites(interaction, staffRoleId || null)
      );

    const channel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: categoryId && categoryId !== "none" ? categoryId : null,
      permissionOverwrites,
      topic: formatTicketChannelTopic(
        ticketType,
        member.user?.tag || member.id,
      ),
    });

    registerTicket(member.id, channel.id);

    console.log(
      `[ticketUtils] Ticket criado: ${channel.name} (${channel.id}) para ${member.id}.`,
    );

    return channel;
  } catch (error) {
    console.error("[ticketUtils] Erro ao criar canal de ticket:", error);
    return null;
  }
}

/**
 * Cria um tópico privado para discussão da equipe.
 * @param {import("discord.js").TextChannel} ticketChannel
 * @param {string} staffRoleId
 * @returns {Promise<import("discord.js").ThreadChannel|null>}
 */
export async function createStaffDiscussionThread(
  ticketChannel,
  staffRoleId,
) {
  if (!ticketChannel || !staffRoleId) {
    return null;
  }

  try {
    const thread = await ticketChannel.threads.create({
      name: getStaffDiscussionThreadName(),
      autoArchiveDuration: 60,
      type: ChannelType.PrivateThread,
    });

    const role = ticketChannel.guild?.roles.cache.get(staffRoleId);

    if (role) {
      await Promise.allSettled(
        [...role.members.values()].map((member) =>
          thread.members.add(member.id),
        ),
      );
    }

    return thread;
  } catch (error) {
    console.error(
      "[ticketUtils] Erro ao criar discussão privada da equipe:",
      error,
    );
    return null;
  }
}

/**
 * Identifica erros temporários de conexão com a API.
 * @param {any} error
 * @returns {boolean}
 */
function isRetryableTicketDeletionError(error) {
  const errorCode = error?.code ?? error?.cause?.code;
  const status = error?.status ?? error?.statusCode;

  return (
    [
      "UND_ERR_CONNECT_TIMEOUT",
      "ECONNRESET",
      "ECONNREFUSED",
      "ETIMEDOUT",
      "ECONNABORTED",
    ].includes(errorCode) ||
    [500, 502, 503, 504].includes(status)
  );
}

/**
 * Exclui o canal e remove o registro somente após a exclusão
 * ser confirmada ou o canal já não existir.
 * @param {import("discord.js").TextChannel} channel
 * @param {number} retriesRemaining
 * @returns {Promise<boolean>}
 */
async function deleteTicketChannel(channel, retriesRemaining = 3) {
  try {
    await channel.delete("Ticket fechado.");

    removeTicketByChannel(channel.id);

    console.log(
      `[ticketUtils] Canal de ticket excluído: ${channel.id}.`,
    );

    return true;
  } catch (error) {
    // Discord: Unknown Channel. O canal já não existe.
    if (Number(error?.code) === 10003) {
      removeTicketByChannel(channel.id);

      console.warn(
        `[ticketUtils] O canal ${channel.id} já não existe; registro removido.`,
      );

      return true;
    }

    if (retriesRemaining > 0 && isRetryableTicketDeletionError(error)) {
      console.warn(
        `[ticketUtils] Falha temporária ao excluir ${channel.id}. ` +
          `Nova tentativa em 5 segundos (${retriesRemaining} restantes).`,
        error,
      );

      setTimeout(() => {
        void deleteTicketChannel(channel, retriesRemaining - 1);
      }, 5000);

      return false;
    }

    console.error(
      `[ticketUtils] Não foi possível excluir o canal ${channel.id}.`,
      error,
    );

    // Mantém o registro para impedir outro ticket enquanto
    // o canal antigo continuar existindo.
    return false;
  }
}

/**
 * Agenda o fechamento de um ticket.
 *
 * Não responde à interaction: quem controla deferReply/editReply
 * é o ticketSystem.
 *
 * @param {import("discord.js").Interaction} interaction
 * @returns {Promise<boolean>}
 */
export async function closeTicket(interaction) {
  const channel = interaction?.channel;

  if (!channel || typeof channel.delete !== "function") {
    throw new Error(
      "[closeTicket] Canal do ticket não encontrado ou inválido.",
    );
  }

  console.log(
    `[ticketUtils] Fechamento solicitado para o canal ${channel.id}.`,
  );

  setTimeout(() => {
    void deleteTicketChannel(channel);
  }, 3000);

  return true;
}