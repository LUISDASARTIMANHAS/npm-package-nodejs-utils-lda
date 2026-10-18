// @ts-check

import { SlashCommandBuilder } from "@discordjs/builders";
import {
  PermissionFlagsBits,
  version as discordJsVersion,
} from "discord.js";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

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

import { replyInteraction } from "../interactionResponses.mjs";
import { fopen, fwrite } from "../../autoFileSysModule.mjs";

const UPDATE_INTERVAL = 120_000;
const DATA_FILE = join(process.cwd(), "data", "monitor-panels.json");

/**
 * @typedef {{
 *   channelId: string,
 *   channelName: string,
 *   guildName: string,
 *   messageId: string
 * }} SavedPanel
 */

/**
 * @typedef {{
 *   message: import("discord.js").Message,
 *   interval: ReturnType<typeof setInterval>,
 *   updating: boolean
 * }} MonitorState
 */

/**
 * @typedef {{
 *   panels: Map<string, MonitorState>,
 *   busyGuilds: Set<string>,
 *   restoring: boolean
 * }} MonitorRegistry
 */

/**
 * Cada cliente possui seus próprios painéis ativos.
 *
 * @type {WeakMap<import("discord.js").Client, MonitorRegistry>}
 */
const monitors = new WeakMap();

/**
 * Evita registrar mais de um evento de inicialização por cliente.
 *
 * @type {WeakSet<import("discord.js").Client>}
 */
const initializedBots = new WeakSet();

/**
 * Garante que a pasta de dados exista.
 */
function ensureDataFile() {
  mkdirSync(dirname(DATA_FILE), { recursive: true });

  if (!existsSync(DATA_FILE)) {
    fwrite(DATA_FILE, {});
  }
}

/**
 * Lê todos os painéis persistidos.
 *
 * Estrutura:
 * {
 *   "botId": {
 *     "guildId": {
 *       "channelId": "...",
 *       "channelName": "...",
 *       "guildName": "...",
 *       "messageId": "..."
 *     }
 *   }
 * }
 *
 * @returns {Record<string, Record<string, SavedPanel>>}
 */
function readSavedPanels() {
  ensureDataFile();

  const data = fopen(DATA_FILE);

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return {};
  }

  return data;
}

/**
 * Salva os painéis de um cliente sem apagar os registros de outros bots.
 *
 * @param {string} botId
 * @param {Record<string, SavedPanel>} panels
 */
function savePanels(botId, panels) {
  const data = readSavedPanels();
  data[botId] = panels;
  fwrite(DATA_FILE, data);
}

/**
 * Obtém ou cria o registro em memória.
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
      restoring: false,
    };

    monitors.set(bot, registry);
  }

  return registry;
}

/**
 * Define o comando /monitor.
 */
export const monitorCommand = new SlashCommandBuilder()
  .setName("monitor")
  .setDescription("Cria um painel de monitoramento ao vivo do bot")
  .toJSON();

/**
 * Responde sem tentar fazer um ACK duplicado.
 *
 * @param {import("discord.js").ChatInputCommandInteraction} interaction
 * @param {string} content
 */
async function respond(interaction, content) {
  await replyInteraction(interaction, {
    content,
    ephemeral: true,
    allowedMentions: { parse: [] },
  });
}

/**
 * Formata o tempo de atividade.
 *
 * @param {number} ms
 * @returns {string}
 */
function formatUptime(ms) {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;

  return `${days}d ${hours}h ${minutes}m ${remainder}s`;
}

/**
 * Cria o embed do painel.
 *
 * @param {import("discord.js").Client} bot
 * @returns {import("discord.js").EmbedBuilder}
 */
function createMonitorEmbed(bot) {
  const memory = process.memoryUsage();
  const mb = (bytes) => (bytes / 1024 / 1024).toFixed(1);
  const ready = bot.isReady();
  const ping = ready ? Math.round(bot.ws.ping) : -1;

  const latencyStatus =
    ping < 0 ? "⚪" :
    ping < 150 ? "🟢" :
    ping < 300 ? "🟡" : "🔴";

  return setEmbed(
    "📡 Monitoramento do Bot",
    [
      `**Estado:** ${ready ? "🟢 Conectado" : "🔴 Desconectado"}`,
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
      createField("💾 Heap", `${mb(memory.heapUsed)} / ${mb(memory.heapTotal)} MB`, true),
      createField("🧠 Memória RSS", `${mb(memory.rss)} MB`, true),
      createField("🟩 Node.js", process.version, true),
      createField("📦 Discord.js", discordJsVersion, true),
    ],
  );
}

/**
 * Persiste o estado atual dos painéis de um cliente.
 *
 * @param {import("discord.js").Client} bot
 */
function persistRegistry(bot) {
  const botId = bot.user?.id;

  if (!botId) return;

  /** @type {Record<string, SavedPanel>} */
  const saved = {};

  for (const [guildId, state] of getRegistry(bot).panels) {
    const guild = bot.guilds?.cache.get(guildId);
    const channel = bot.channels?.cache.get(state.message.channelId);

    saved[guildId] = {
      channelId: state.message.channelId,
      channelName: channel?.name ?? "desconhecido",
      guildName: guild?.name ?? "desconhecido",
      messageId: state.message.id,
    };
  }

  savePanels(botId, saved);
}

/**
 * Atualiza o painel e interrompe o monitor se o recurso foi removido
 * ou se o bot perdeu acesso à mensagem.
 *
 * @param {import("discord.js").Client} bot
 * @param {string} guildId
 * @param {MonitorState} state
 */
async function updatePanel(bot, guildId, state) {
  if (state.updating) return;

  state.updating = true;

  try {
    await state.message.edit({
      embeds: [createMonitorEmbed(bot)],
      allowedMentions: { parse: [] },
    });
  } catch (error) {
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? Number(error.code)
        : null;

    console.error("[Monitor] Erro ao atualizar o painel:", error);

    if ([10003, 10008, 50001, 50013].includes(code ?? -1)) {
      stopMonitor(bot, guildId);
    }
  } finally {
    state.updating = false;
  }
}

/**
 * Registra as atualizações automáticas para uma mensagem existente.
 *
 * @param {import("discord.js").Client} bot
 * @param {string} guildId
 * @param {import("discord.js").Message} message
 */
function startMonitor(bot, guildId, message) {
  const registry = getRegistry(bot);
  const existing = registry.panels.get(guildId);

  if (existing) {
    clearInterval(existing.interval);
  }

  /** @type {MonitorState} */
  const state = {
    message,
    updating: false,
    interval: setInterval(() => {
      void updatePanel(bot, guildId, state);
    }, UPDATE_INTERVAL),
  };

  state.interval.unref?.();
  registry.panels.set(guildId, state);
}

/**
 * Para e remove o registro persistido de um painel.
 *
 * @param {import("discord.js").Client} bot
 * @param {string} guildId
 */
function stopMonitor(bot, guildId) {
  const registry = getRegistry(bot);
  const state = registry.panels.get(guildId);

  if (state) {
    clearInterval(state.interval);
    registry.panels.delete(guildId);
  }

  persistRegistry(bot);
}

/**
 * Restaura os painéis salvos após o cliente ficar pronto.
 *
 * @param {import("discord.js").Client} bot
 */
export async function restoreMonitorPanels(bot) {
  if (!bot.isReady() || !bot.user) return;

  const registry = getRegistry(bot);

  if (registry.restoring) return;
  registry.restoring = true;

  try {
    const savedData = readSavedPanels();
    const botId = bot.user.id;
    const saved = savedData[botId] ?? {};
    let changed = false;

    for (const [guildId, panel] of Object.entries(saved)) {
      try {
        if (
          !panel ||
          typeof panel.channelId !== "string" ||
          typeof panel.messageId !== "string"
        ) {
          delete saved[guildId];
          changed = true;
          continue;
        }

        const channel =
          bot.channels.cache.get(panel.channelId) ??
          await bot.channels.fetch(panel.channelId).catch(() => null);

        if (
          !channel ||
          !channel.isTextBased() ||
          !("messages" in channel)
        ) {
          delete saved[guildId];
          changed = true;
          continue;
        }

        const message = await channel.messages
          .fetch(panel.messageId)
          .catch(() => null);

        if (!message) {
          delete saved[guildId];
          changed = true;
          continue;
        }

        startMonitor(bot, guildId, message);
        await updatePanel(bot, guildId, registry.panels.get(guildId));
        console.log(`[Monitor] Painel restaurado para o servidor ${guildId}.`);
      } catch (error) {
        console.error(`[Monitor] Falha ao restaurar ${guildId}:`, error);
      }
    }

    if (changed) {
      savePanels(botId, saved);
    }
  } finally {
    registry.restoring = false;
  }
}

/**
 * Inicializa a restauração automática deste cliente.
 *
 * Chame esta função ao criar o cliente Discord, antes ou depois de login().
 *
 * @param {import("discord.js").Client} bot
 */
export function initializeMonitor(bot) {
  if (initializedBots.has(bot)) return;

  initializedBots.add(bot);

  bot.once("ready", () => {
    void restoreMonitorPanels(bot);
  });

  // Também funciona se o cliente já estiver conectado.
  if (bot.isReady()) {
    void restoreMonitorPanels(bot);
  }
}

/**
 * Trata o comando /monitor.
 *
 * @param {import("discord.js").ChatInputCommandInteraction} interaction
 */
export async function handleMonitor(interaction) {
  if (
    !interaction.isChatInputCommand() ||
    getCommandNameByInteraction(interaction) !== "monitor"
  ) {
    return;
  }

  const guildId = interaction.guildId;

  if (!guildId) {
    await respond(interaction, "❌ Use este comando em um servidor Discord.");
    return;
  }

  if (!interaction.deferred && !interaction.replied) {
    await interaction.deferReply({ ephemeral: true });
  }

  const bot = getBotByInteraction(interaction);
  const channel = getChannelFromInteraction(interaction);

  initializeMonitor(bot);

  if (!bot.isReady() || !bot.user) {
    await respond(interaction, "❌ O bot ainda não está pronto.");
    return;
  }

  const registry = getRegistry(bot);

  if (registry.busyGuilds.has(guildId)) {
    await respond(interaction, "⏳ O painel está sendo processado. Tente novamente.");
    return;
  }

  registry.busyGuilds.add(guildId);

  try {
    const existing = registry.panels.get(guildId);

    if (existing) {
      try {
        await existing.message.edit({
          embeds: [createMonitorEmbed(bot)],
          allowedMentions: { parse: [] },
        });

        await respond(
          interaction,
          `✅ O painel existente foi atualizado: ${existing.message.url}`,
        );
        return;
      } catch {
        stopMonitor(bot, guildId);
      }
    }

    if (
      !channel?.isTextBased() ||
      !("send" in channel) ||
      typeof channel.send !== "function" ||
      !("permissionsFor" in channel) ||
      typeof channel.permissionsFor !== "function"
    ) {
      await respond(interaction, "❌ Este canal não permite enviar o painel.");
      return;
    }

    const permissions = channel.permissionsFor(bot.user);
    const sendPermission = channel.isThread?.()
      ? PermissionFlagsBits.SendMessagesInThreads
      : PermissionFlagsBits.SendMessages;

    if (
      !permissions?.has([
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.EmbedLinks,
        sendPermission,
      ])
    ) {
      await respond(
        interaction,
        "❌ O bot precisa de permissões para visualizar o canal, enviar mensagens e incorporar links.",
      );
      return;
    }

    const message = await channel.send({
      embeds: [createMonitorEmbed(bot)],
      allowedMentions: { parse: [] },
    });

    startMonitor(bot, guildId, message);
    persistRegistry(bot);

    await respond(
      interaction,
      `✅ Painel criado: ${message.url}\nAtualização automática a cada 120 segundos.`,
    );
  } catch (error) {
    console.error("[Monitor] Não foi possível criar o painel:", error);
    await respond(
      interaction,
      "❌ Não foi possível criar o painel. Verifique as permissões e tente novamente.",
    );
  } finally {
    registry.busyGuilds.delete(guildId);
  }
}