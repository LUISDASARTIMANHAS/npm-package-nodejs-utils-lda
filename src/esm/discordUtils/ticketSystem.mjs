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
	parseTicketCreateCustomId,
	parseTicketCloseCustomId,
} from "./ticketUtils.mjs";

import {
	createTicketTranscript,
	sendTicketTranscriptToLog,
} from "./ticketTranscript.mjs";

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
	},
};

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

	async function replyEphemeral(interaction, content) {
		if (interaction.deferred) {
			return interaction.editReply({ content });
		}

		if (interaction.replied) {
			return interaction.followUp({
				content,
				flags: MessageFlags.Ephemeral,
			});
		}

		return interaction.reply({
			content,
			flags: MessageFlags.Ephemeral,
		});
	}

	async function handleCreate(interaction) {
		const { ticketType, categoryId, staffRoleId, logChannelId } =
			parseTicketCreateCustomId(interaction.customId);

		if (!interaction.deferred && !interaction.replied) {
			await interaction.deferReply({
				flags: MessageFlags.Ephemeral,
			});
		}

		if (!interaction.guild) {
			await replyEphemeral(
				interaction,
				"Este botão só pode ser usado dentro de um servidor.",
			);
			return;
		}

		if (categoryId) {
			const category = await interaction.guild.channels
				.fetch(categoryId)
				.catch(() => null);

			if (!category || category.type !== ChannelType.GuildCategory) {
				await replyEphemeral(interaction, config.messages.invalidCategory);
				return;
			}
		}

		const channel = await createTicketChannelFromInteraction(interaction, {
			ticketType,
			categoryId,
			staffRoleId,
		});

		if (!channel) {
			await replyEphemeral(interaction, config.messages.createError);
			return;
		}

		let staffTopic = null;

		try {
			staffTopic = await createStaffDiscussionThread(channel, staffRoleId);
		} catch (error) {
			console.error("[ticketSystem] Erro ao criar tópico da equipe:", error);
		}

		const ticketLabel = String(ticketType || "suporte");
		const capitalizedType =
			ticketLabel.charAt(0).toUpperCase() + ticketLabel.slice(1);

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

		const closeCustomId = `close_ticket:${ticketLabel}:${logChannelId || "none"}`;

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
			await channel.send({
				content: `<@${interaction.user.id}>${staffMessage}`,
				embeds: [embed],
				components: [row],
			});
		} catch (error) {
			console.error("[ticketSystem] Erro ao enviar mensagem inicial:", error);

			await replyEphemeral(
				interaction,
				`O canal ${channel} foi criado, mas não consegui enviar a mensagem inicial.`,
			);
			return;
		}

		await replyEphemeral(
			interaction,
			`Ticket criado: ${channel}\nClassificação: **${ticketLabel.toUpperCase()}**`,
		);
	}

	async function handleClose(interaction) {
		if (!interaction.deferred && !interaction.replied) {
			await interaction.deferReply({
				flags: MessageFlags.Ephemeral,
			});
		}

		const { logChannelId } = parseTicketCloseCustomId(interaction.customId);

		const channel = interaction.channel;

		if (!channel?.isTextBased()) {
			await replyEphemeral(
				interaction,
				"Não foi possível identificar o canal deste ticket.",
			);
			return;
		}

		if (config.transcripts.enabled) {
			let transcriptData = null;

			try {
				transcriptData = await createTicketTranscript(channel, {
					closedBy:
						interaction.user?.tag ??
						interaction.user?.username ??
						"Desconhecido",
					directory: config.transcripts.directory,
					messageLimit: config.transcripts.messageLimit,
				});
			} catch (error) {
				console.error("[ticketSystem] Erro ao gerar transcrição:", error);
			}

			if (transcriptData) {
				try {
					await sendTicketTranscriptToLog(interaction.client, transcriptData, {
						channelId:
							logChannelId && logChannelId !== "none"
								? logChannelId
								: config.transcripts.channelId,
						ticketName: channel.name,
					});
				} catch (error) {
					console.error("[ticketSystem] Erro ao enviar transcrição:", error);
				}
			}
		}

		try {
			await closeTicket(interaction);
		} catch (error) {
			console.error("[ticketSystem] Erro ao fechar ticket:", error);

			if (interaction.deferred || interaction.replied) {
				await interaction
					.editReply({
						content: config.messages.closeError,
					})
					.catch(() => {});
			}
		}
	}

	async function handleInteraction(interaction) {
		if (!interaction?.isButton?.()) {
			return false;
		}

		if (interaction.customId.startsWith("create_ticket:")) {
			await handleCreate(interaction);
			return true;
		}

		if (interaction.customId.startsWith("close_ticket:")) {
			await handleClose(interaction);
			return true;
		}

		return false;
	}

	return {
		handleInteraction,
	};
}
