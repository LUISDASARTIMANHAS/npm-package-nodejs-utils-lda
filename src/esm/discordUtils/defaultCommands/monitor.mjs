// @ts-check

import { SlashCommandBuilder } from "@discordjs/builders";
import {
  PermissionFlagsBits,
  version as discordJsVersion,
} from "discord.js";

import {
  createField,
  getChannelsCount,
  getGuildsCount,
  getUsersCount,
  setEmbed,
} from "../discordUtils.mjs";

import {
  getBotByInteraction,
  getChannelFromInteraction,
  getCommandNameByInteraction,
} from "../interactionGetters.mjs";

const UPDATE_INTERVAL = 30_000;

/**
 * @typedef {object} MonitorState
 * @property {import("discord.js").Message} message
 * @property {ReturnType<typeof setInterval>} interval
 * @property {boolean} updating
 */

/**
 * @typedef {object} MonitorRegistry
 * @property {Map<string, MonitorState>} panels
 * @property {Set<string>} busyGuilds
 */

/**
 * Armazena os painéis por instância do cliente e ID do servidor.
 * O registro também impede a criação simultânea de painéis duplicados.
 *
 * @type {WeakMap<import("discord.js").Client, MonitorRegistry>}
 */
const monitors = new WeakMap();

/**
 * Define o comando slash /monitor.
 * Não restringe o uso por cargo ou permissão do usuário.
 */
export const monitorCommand = new SlashCommandBuilder()
  .setName("monitor")
  .setDescription("Cria um painel de monitoramento ao vivo do bot")
  .toJSON();

/**
 * Obtém ou cria o registro de painéis do cliente.
 *
 * @param {import("discord.js").Client} bot
 * @returns {MonitorRegistry}
 */
function getRegistry(bot) {
  let registry = monitors.get(bot);

  if (!registry) {
    registry = {
      panels: new Map(),
      busyGuilds: new Set(),
    };

    monitors.set(bot, registry);
  }

  return registry;
}

/**
 * Formata o tempo de atividade.
 *
 * @param {number} [ms]
 * @returns {string}
 */
function formatUptime(ms = 0) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

/**
 * Retorna o consumo de memória do processo Node.js.
 *
 * @returns {{heapUsed: string, heapTotal: string, rss: string}}
 */
function getMemoryUsage() {
  const memory = process.memoryUsage();
  const toMB = (bytes) => (bytes / 1024 / 1024).toFixed(1);

  return {
    heapUsed: toMB(memory.heapUsed),
    heapTotal: toMB(memory.heapTotal),
    rss: toMB(memory.rss),
  };
}

/**
 * Extrai o código numérico de um erro, quando disponível.
 *
 * @param {unknown} error
 * @returns {number | null}
 */
function getErrorCode(error) {
  if (
    typeof error !== "object" ||
    error === null ||
    !("code" in error)
  ) {
    return null;
  }

  const code = Number(error.code);

  return Number.isFinite(code) ? code : null;
}

/**
 * Cria o embed com as estatísticas atuais.
 *
 * @param {import("discord.js").Client} bot
 * @returns {import("discord.js").EmbedBuilder}
 */
function createMonitorEmbed(bot) {
  const memory = getMemoryUsage();
  const ready = bot.isReady();
  const ping = ready ? Math.round(bot.ws.ping) : -1;

  const status = ready ? "🟢 Conectado" : "🔴 Desconectado";

  const latencyStatus =
    ping < 0 ? "⚪" :
    ping < 150 ? "🟢" :
    ping < 300 ? "🟡" : "🔴";

  return setEmbed(
    "📡 Monitoramento do Bot",
    [
      `**Estado:** ${status}`,
      `**Última atualização:** <t:${Math.floor(Date.now() / 1000)}:T>`,
    ].join("\n"),
    ready ? 0x00aeff : 0xe74c3c,
    "Monitor",
    "",
    [
      createField("🏠 Servidores", String(getGuildsCount(bot)), true),
      createField("👥 Usuários", String(getUsersCount(bot)), true),
      createField("📺 Canais", String(getChannelsCount(bot)), true),
      createField(
        "📶 Latência",
        ping >= 0 ? `${latencyStatus} ${ping} ms` : "Indisponível",
        true,
      ),
      createField("⏱️ Uptime", formatUptime(bot.uptime ?? 0), true),
      createField(
        "💾 Heap",
        `${memory.heapUsed} / ${memory.heapTotal} MB`,
        true,
      ),
      createField("🧠 Memória RSS", `${memory.rss} MB`, true),
      createField("🟩 Node.js", process.version, true),
      createField("📦 Discord.js", discordJsVersion, true),
    ],
  );
}

/**
 * Atualiza o painel existente.
 *
 * @param {import("discord.js").Client} bot
 * @param {import("discord.js").Message} message
 * @returns {Promise<import("discord.js").Message>}
 */
async function updateMonitor(bot, message) {
  return message.edit({
    embeds: [createMonitorEmbed(bot)],
    allowedMentions: { parse: [] },
  });
}

/**
 * Encerra a atualização automática e remove o painel do registro.
 *
 * @param {import("discord.js").Client} bot
 * @param {string} guildId
 */
function stopMonitor(bot, guildId) {
  const registry = monitors.get(bot);
  const existing = registry?.panels.get(guildId);

  if (!registry || !existing) return;

  clearInterval(existing.interval);
  registry.panels.delete(guildId);
}

/**
 * Trata o comando /monitor.
 *
 * O painel é único por servidor e pode ser criado por qualquer usuário.
 *
 * @param {import("discord.js").ChatInputCommandInteraction} interaction
 * @returns {Promise<void>}
 */
export async function handleMonitor(interaction) {
  if (
    !interaction.isChatInputCommand() ||
    getCommandNameByInteraction(interaction) !== "monitor"
  ) {
    return;
  }

  // O comando precisa ser executado dentro de um servidor.
  const guildId = interaction.guildId;

  if (!guildId) {
    await interaction.reply({
      content: "❌ Este comando só pode ser usado em um servidor Discord.",
      ephemeral: true,
    });
    return;
  }

  // Confirma a interação antes de executar operações de rede.
  await interaction.deferReply({ ephemeral: true });

  const bot = getBotByInteraction(interaction);
  const channel = getChannelFromInteraction(interaction);

  if (!bot.isReady() || !bot.user) {
    await interaction.editReply("❌ O bot ainda não está pronto.");
    return;
  }

  if (
    !channel?.isTextBased() ||
    !("send" in channel) ||
    typeof channel.send !== "function" ||
    !("permissionsFor" in channel) ||
    typeof channel.permissionsFor !== "function"
  ) {
    await interaction.editReply(
      "❌ Este canal não permite enviar o painel de monitoramento.",
    );
    return;
  }

  const registry = getRegistry(bot);

  // Evita duas criações simultâneas no mesmo servidor.
  if (registry.busyGuilds.has(guildId)) {
    await interaction.editReply(
      "⏳ O painel deste servidor já está sendo processado. Tente novamente em instantes.",
    );
    return;
  }

  registry.busyGuilds.add(guildId);

  try {
    const existing = registry.panels.get(guildId);

    // Reutiliza o painel existente, mesmo que esteja em outro canal.
    if (existing) {
      try {
        await updateMonitor(bot, existing.message);

        await interaction.editReply(
          `✅ O painel existente foi atualizado: ${existing.message.url}`,
        );
        return;
      } catch (error) {
        console.warn(
          "[Monitor] O painel anterior não pôde ser atualizado:",
          error,
        );

        stopMonitor(bot, guildId);
      }
    }

    const permissions = channel.permissionsFor(bot.user);

    const requiredPermissions = [
      PermissionFlagsBits.ViewChannel,
      PermissionFlagsBits.EmbedLinks,
      channel.isThread?.()
        ? PermissionFlagsBits.SendMessagesInThreads
        : PermissionFlagsBits.SendMessages,
    ];

    if (!permissions?.has(requiredPermissions)) {
      await interaction.editReply(
        "❌ O bot precisa de permissão para visualizar este canal, enviar mensagens e incorporar links.",
      );
      return;
    }

    const message = await channel.send({
      embeds: [createMonitorEmbed(bot)],
      allowedMentions: { parse: [] },
    });

    /** @type {MonitorState} */
    const monitor = {
      message,
      updating: false,
      interval: setInterval(async () => {
        if (monitor.updating) return;

        monitor.updating = true;

        try {
          await updateMonitor(bot, message);
        } catch (error) {
          const code = getErrorCode(error);

          console.error(
            "[Monitor] Falha ao atualizar o painel:",
            error,
          );

          // Mensagem/canal inexistente ou permissões removidas.
          if ([10003, 10008, 50001, 50013].includes(code ?? -1)) {
            stopMonitor(bot, guildId);
          }
        } finally {
          monitor.updating = false;
        }
      }, UPDATE_INTERVAL),
    };

    monitor.interval.unref?.();
    registry.panels.set(guildId, monitor);

    await interaction.editReply(
      `✅ Painel criado: ${message.url}\n` +
      "Atualização automática a cada 30 segundos.",
    );
  } catch (error) {
    console.error(
      "[Monitor] Não foi possível criar ou atualizar o painel:",
      error,
    );

    await interaction.editReply(
      "❌ Não foi possível criar o painel. Verifique as permissões do bot e tente novamente.",
    );
  } finally {
    registry.busyGuilds.delete(guildId);
  }
}