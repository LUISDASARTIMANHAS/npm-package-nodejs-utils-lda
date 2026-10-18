// src/esm/discordUtils/ticketSystem.mjs

import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    EmbedBuilder,
    MessageFlags,
} from "discord.js";

import {
    createTicketChannelFromInteraction,
    createStaffDiscussionThread,
    closeTicket,
    hasOpenTicket,
    parseTicketCreateCustomId,
    parseTicketCloseCustomId,
} from "./ticketUtils.mjs";

import {
    createTicketTranscript,
    sendTicketTranscriptToLog,
} from "./ticketTranscript.mjs";

import { log, logError } from "../logger/index.mjs";

const LOG_FILE = "tickets.log";

const DEFAULT_CONFIG = {
    colors: {
        opened: 0x00ff00,
    },

    transcripts: {
        enabled: true,
        formats: ["txt", "html"],
        directory: "logs/tickets",
        channelId: process.env.TICKET_LOG_CHANNEL_ID,
        messageLimit: 100,
    },

    messages: {
        invalidCategory:
            "Categoria inválida para tickets. Selecione uma categoria válida.",

        createError:
            "Não foi possível abrir o ticket. Verifique as permissões do bot.",

        closeError:
            "Não foi possível fechar o ticket. Verifique as permissões do bot.",

        alreadyOpen:
            "Você já possui um ticket aberto.",

        opened:
            "Ticket criado com sucesso.",

        closing:
            "Fechando ticket...",
    },
};

/**
 * Registra uma mensagem informativa.
 * @param {string} message
 */
function ticketLog(message) {
    try {
        log(`[ticketSystem] ${message}`, LOG_FILE);
    } catch (error) {
        console.error("[ticketSystem] Falha ao registrar log:", error);
    }
}

/**
 * Registra um erro.
 * @param {string} message
 * @param {unknown} error
 */
function ticketLogError(message, error) {
    const details =
        error instanceof Error
            ? error.stack || error.message
            : String(error ?? "Erro desconhecido");

    try {
        logError(
            `[ticketSystem] ${message}\n${details}`,
            LOG_FILE,
        );
    } catch (loggingError) {
        console.error(
            "[ticketSystem] Falha ao registrar erro:",
            loggingError,
        );
        console.error(message, error);
    }
}

/**
 * Identifica uma interação nos logs.
 * @param {import("discord.js").Interaction} interaction
 * @returns {string}
 */
function getInteractionContext(interaction) {
    return [
        `interaction=${interaction.id}`,
        `customId=${interaction.isButton() ? interaction.customId : "indisponível"}`,
        `user=${interaction.user?.id ?? "indisponível"}`,
        `channel=${interaction.channelId ?? "indisponível"}`,
        `guild=${interaction.guildId ?? "indisponível"}`,
    ].join("; ");
}

/**
 * Responde à interação sem duplicar o reconhecimento.
 * @param {import("discord.js").Interaction} interaction
 * @param {string} content
 */
async function replyEphemeral(interaction, content) {
    ticketLog(
        `Preparando resposta. ${getInteractionContext(interaction)}; ` +
        `deferred=${interaction.deferred}; replied=${interaction.replied}.`,
    );

    if (interaction.deferred) {
        ticketLog("Enviando resposta por editReply.");
        return interaction.editReply({ content });
    }

    if (interaction.replied) {
        ticketLog("Enviando resposta adicional por followUp.");
        return interaction.followUp({
            content,
            flags: MessageFlags.Ephemeral,
        });
    }

    ticketLog("Enviando primeira resposta por reply.");
    return interaction.reply({
        content,
        flags: MessageFlags.Ephemeral,
    });
}

export function createTicketSystem(options = {}) {
    const config = {
        ...DEFAULT_CONFIG,
        ...options,

        colors: {
            ...DEFAULT_CONFIG.colors,
            ...options.colors,
        },

        transcripts: {
            ...DEFAULT_CONFIG.transcripts,
            ...options.transcripts,
        },

        messages: {
            ...DEFAULT_CONFIG.messages,
            ...options.messages,
        },
    };

    ticketLog(
        `Sistema de tickets inicializado. ` +
        `transcripts=${config.transcripts.enabled}; ` +
        `formats=${config.transcripts.formats.join(",")}; ` +
        `messageLimit=${config.transcripts.messageLimit}.`,
    );

    /**
     * Trata a criação de tickets.
     */
    async function handleCreate(interaction) {
        const context = getInteractionContext(interaction);
        const startedAt = Date.now();

        ticketLog(`Iniciando criação. ${context}.`);

        let parsed;

        try {
            parsed = parseTicketCreateCustomId(interaction.customId);
        } catch (error) {
            ticketLogError(
                `Falha ao interpretar o customId de criação. ${context}.`,
                error,
            );
            throw error;
        }

        const {
            ticketType,
            categoryId,
            staffRoleId,
            logChannelId,
        } = parsed;

        ticketLog(
            `Dados de criação interpretados. ${context}; ` +
            `tipo=${ticketType}; categoria=${categoryId ?? "nenhuma"}; ` +
            `cargoEquipe=${staffRoleId ?? "nenhum"}; ` +
            `canalLogs=${logChannelId ?? "nenhum"}.`,
        );

        try {
            if (!interaction.deferred && !interaction.replied) {
                ticketLog(`Reconhecendo interação de criação. ${context}.`);

                await interaction.deferReply({
                    flags: MessageFlags.Ephemeral,
                });

                ticketLog(`Interação de criação reconhecida. ${context}.`);
            } else {
                ticketLog(
                    `A interação já foi reconhecida antes da criação. ${context}; ` +
                    `deferred=${interaction.deferred}; replied=${interaction.replied}.`,
                );
            }

            if (!interaction.guild) {
                ticketLog(`Criação recusada: interação sem servidor. ${context}.`);

                await replyEphemeral(
                    interaction,
                    "Este botão só pode ser usado dentro de um servidor.",
                );
                return;
            }

            if (categoryId) {
                ticketLog(
                    `Consultando categoria. ${context}; categoria=${categoryId}.`,
                );

                const category = await interaction.guild.channels
                    .fetch(categoryId)
                    .catch((error) => {
                        ticketLogError(
                            `Falha ao consultar categoria. ${context}; categoria=${categoryId}.`,
                            error,
                        );
                        return null;
                    });

                if (
                    !category ||
                    category.type !== ChannelType.GuildCategory
                ) {
                    ticketLog(
                        `Categoria inválida. ${context}; categoria=${categoryId}.`,
                    );

                    await replyEphemeral(
                        interaction,
                        config.messages.invalidCategory,
                    );
                    return;
                }

                ticketLog(
                    `Categoria validada. ${context}; categoria=${categoryId}.`,
                );
            }

            ticketLog(`Verificando ticket aberto existente. ${context}.`);

            if (hasOpenTicket(interaction.user.id)) {
                ticketLog(
                    `Criação recusada: usuário já possui ticket. ${context}.`,
                );

                await replyEphemeral(
                    interaction,
                    config.messages.alreadyOpen,
                );
                return;
            }

            ticketLog(`Criando canal de ticket. ${context}; tipo=${ticketType}.`);

            const channel = await createTicketChannelFromInteraction(
                interaction,
                {
                    ticketType,
                    categoryId,
                    staffRoleId,
                },
            );

            if (!channel) {
                ticketLog(
                    `Criação não concluída: utilitário retornou vazio. ${context}.`,
                );

                await replyEphemeral(
                    interaction,
                    config.messages.createError,
                );
                return;
            }

            ticketLog(
                `Canal criado. ${context}; novoCanal=${channel.id}; ` +
                `nome=${channel.name}.`,
            );

            let staffTopic = null;

            if (staffRoleId) {
                ticketLog(
                    `Criando tópico privado da equipe. ${context}; ` +
                    `canal=${channel.id}; cargo=${staffRoleId}.`,
                );

                try {
                    staffTopic = await createStaffDiscussionThread(
                        channel,
                        staffRoleId,
                    );

                    ticketLog(
                        staffTopic
                            ? `Tópico da equipe criado. ${context}; canal=${channel.id}.`
                            : `Tópico da equipe não criado. ${context}; canal=${channel.id}.`,
                    );
                } catch (error) {
                    ticketLogError(
                        `Erro ao criar tópico da equipe. ${context}; canal=${channel.id}.`,
                        error,
                    );
                }
            }

            const ticketLabel = String(ticketType || "suporte");

            const capitalizedType =
                ticketLabel.charAt(0).toUpperCase() +
                ticketLabel.slice(1);

            const embed = new EmbedBuilder()
                .setColor(config.colors.opened)
                .setTitle(`Ticket ${capitalizedType} Aberto`)
                .setDescription(
                    "Obrigado por abrir um ticket. Nossa equipe de suporte irá responder o mais rápido possível.",
                )
                .addFields(
                    {
                        name: "Classificação",
                        value: `**${ticketLabel.toUpperCase()}**`,
                        inline: true,
                    },
                    {
                        name: "Usuário",
                        value: `<@${interaction.user.id}>`,
                        inline: true,
                    },
                    {
                        name: "Instruções",
                        value:
                            "Descreva seu problema com detalhes e adicione capturas de tela quando necessário.",
                        inline: false,
                    },
                    {
                        name: "Importante",
                        value:
                            "Esta conversa poderá ser registrada em uma transcrição após o fechamento.",
                        inline: false,
                    },
                );

            const closeCustomId =
                `close_ticket:${ticketLabel}:${logChannelId || "none"}`;

            ticketLog(
                `Montando botão de fechamento. ${context}; ` +
                `closeCustomId=${closeCustomId}.`,
            );

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(closeCustomId)
                    .setLabel("Fechar Ticket")
                    .setStyle(ButtonStyle.Danger),
            );

            const staffMessage = staffTopic
                ? `\n\nTópico privado da equipe: ${staffTopic}`
                : "";

            try {
                ticketLog(
                    `Enviando mensagem inicial. ${context}; canal=${channel.id}.`,
                );

                await channel.send({
                    content: `<@${interaction.user.id}>${staffMessage}`,
                    embeds: [embed],
                    components: [row],
                });

                ticketLog(
                    `Mensagem inicial enviada. ${context}; canal=${channel.id}.`,
                );
            } catch (error) {
                ticketLogError(
                    `Canal criado, mas a mensagem inicial falhou. ${context}; canal=${channel.id}.`,
                    error,
                );

                await replyEphemeral(
                    interaction,
                    `O canal ${channel} foi criado, mas não consegui enviar a mensagem inicial. Contate a equipe para evitar tickets duplicados.`,
                );
                return;
            }

            ticketLog(
                `Ticket inicializado com sucesso. ${context}; ` +
                `canal=${channel.id}; duração=${Date.now() - startedAt}ms.`,
            );

            await replyEphemeral(
                interaction,
                `Ticket criado: ${channel}\nClassificação: **${ticketLabel.toUpperCase()}**`,
            );

            ticketLog(
                `Criação concluída. ${context}; canal=${channel.id}; ` +
                `duração=${Date.now() - startedAt}ms.`,
            );
        } catch (error) {
            ticketLogError(
                `Erro durante a criação do ticket. ${context}; ` +
                `duração=${Date.now() - startedAt}ms.`,
                error,
            );

            if (interaction.deferred || interaction.replied) {
                await replyEphemeral(
                    interaction,
                    config.messages.createError,
                ).catch((replyError) => {
                    ticketLogError(
                        `Falha ao responder sobre o erro de criação. ${context}.`,
                        replyError,
                    );
                });
            }
        }
    }

    /**
     * Trata o fechamento e a transcrição.
     */
    async function handleClose(interaction) {
        const context = getInteractionContext(interaction);
        const startedAt = Date.now();

        ticketLog(`Iniciando fechamento. ${context}.`);

        let parsed;

        try {
            parsed = parseTicketCloseCustomId(interaction.customId);
        } catch (error) {
            ticketLogError(
                `Falha ao interpretar o customId de fechamento. ${context}.`,
                error,
            );
            throw error;
        }

        const { logChannelId } = parsed;
        const channel = interaction.channel;

        ticketLog(
            `Dados de fechamento interpretados. ${context}; ` +
            `canalLogs=${logChannelId ?? "nenhum"}; ` +
            `transcripts=${config.transcripts.enabled}.`,
        );

        try {
            if (!interaction.deferred && !interaction.replied) {
                ticketLog(`Reconhecendo interação de fechamento. ${context}.`);

                await interaction.deferReply({
                    flags: MessageFlags.Ephemeral,
                });

                ticketLog(`Interação de fechamento reconhecida. ${context}.`);
            } else {
                ticketLog(
                    `A interação de fechamento já foi reconhecida. ${context}; ` +
                    `deferred=${interaction.deferred}; replied=${interaction.replied}.`,
                );
            }

            if (!channel?.isTextBased() || !channel.guild) {
                ticketLog(
                    `Fechamento recusado: canal inválido ou sem servidor. ${context}.`,
                );

                await replyEphemeral(
                    interaction,
                    "Não foi possível identificar o canal deste ticket.",
                );
                return;
            }

            if (config.transcripts.enabled) {
                let transcriptData = null;

                try {
                    ticketLog(
                        `Iniciando geração da transcrição. ${context}; ` +
                        `limite=${config.transcripts.messageLimit}; ` +
                        `formatos=${config.transcripts.formats.join(",")}.`,
                    );

                    transcriptData = await createTicketTranscript(channel, {
                        closedBy:
                            interaction.user?.tag ??
                            interaction.user?.username ??
                            "Desconhecido",
                        directory: config.transcripts.directory,
                        messageLimit: config.transcripts.messageLimit,
                        formats: config.transcripts.formats,
                    });

                    ticketLog(
                        transcriptData
                            ? `Transcrição gerada. ${context}.`
                            : `Transcrição sem dados retornados. ${context}.`,
                    );
                } catch (error) {
                    ticketLogError(
                        `Falha ao gerar transcrição. ${context}.`,
                        error,
                    );
                }

                if (transcriptData) {
                    try {
                        const transcriptChannelId =
                            logChannelId && logChannelId !== "none"
                                ? logChannelId
                                : config.transcripts.channelId;

                        ticketLog(
                            `Enviando transcrição. ${context}; ` +
                            `canalLogs=${transcriptChannelId ?? "não configurado"}.`,
                        );

                        await sendTicketTranscriptToLog(
                            interaction.client,
                            transcriptData,
                            {
                                channelId: transcriptChannelId,
                                ticketName: channel.name,
                            },
                        );

                        ticketLog(
                            `Transcrição enviada ao canal de logs. ${context}.`,
                        );
                    } catch (error) {
                        ticketLogError(
                            `Falha ao enviar transcrição para os logs. ${context}.`,
                            error,
                        );
                    }
                }
            } else {
                ticketLog(`Transcrições desativadas. ${context}.`);
            }

            ticketLog(`Chamando closeTicket. ${context}.`);

            await closeTicket(interaction);

            ticketLog(
                `closeTicket concluído. ${context}; ` +
                `duração=${Date.now() - startedAt}ms.`,
            );

            await replyEphemeral(
                interaction,
                config.messages.closing,
            );

            ticketLog(`Fechamento processado. ${context}.`);
        } catch (error) {
            ticketLogError(
                `Erro durante o fechamento. ${context}; ` +
                `duração=${Date.now() - startedAt}ms.`,
                error,
            );

            await replyEphemeral(
                interaction,
                config.messages.closeError,
            ).catch((replyError) => {
                ticketLogError(
                    `Falha ao responder sobre o erro de fechamento. ${context}.`,
                    replyError,
                );
            });
        }
    }

    /**
     * Dispatcher de interações de ticket.
     * @param {import("discord.js").Interaction} interaction
     * @returns {Promise<boolean>}
     */
    async function handleInteraction(interaction) {
        if (!interaction?.isButton?.()) {
            ticketLog("Dispatcher ignorou interação: não é um botão.");
            return false;
        }

        const context = getInteractionContext(interaction);

        ticketLog(`Dispatcher recebeu botão. ${context}.`);

        try {
            if (interaction.customId.startsWith("create_ticket:")) {
                ticketLog(`Rota de criação selecionada. ${context}.`);

                await handleCreate(interaction);

                ticketLog(`Rota de criação finalizada. ${context}.`);
                return true;
            }

            if (interaction.customId.startsWith("close_ticket:")) {
                ticketLog(`Rota de fechamento selecionada. ${context}.`);

                await handleClose(interaction);

                ticketLog(`Rota de fechamento finalizada. ${context}.`);
                return true;
            }

            ticketLog(
                `Botão não reconhecido pelo sistema de tickets. ${context}.`,
            );

            return false;
        } catch (error) {
            ticketLogError(
                `Erro não tratado no dispatcher. ${context}.`,
                error,
            );

            return true;
        }
    }

    return {
        handleInteraction,
    };
}