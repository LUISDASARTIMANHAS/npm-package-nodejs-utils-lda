// src\esm\discordUtils\ticketTranscript.mjs
import { AttachmentBuilder } from "discord.js";
import { log, logError } from "../logger/index.mjs";
import { existsSync, mkdirSync } from "node:fs";

import path from "node:path";
import { fwrite } from "../autoFileSysModule.mjs";

function escapeHtml(value) {
	return String(value ?? "")
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

function isImageUrl(url) {
	return /\.(png|jpe?g|gif|webp|svg|bmp)(\?.*)?$/i.test(url);
}

function sanitizeFileName(value) {
	return String(value ?? "ticket").replace(/[<>:"/\\|?*\x00-\x1F]/g, "_");
}

function formatDate(timestamp) {
	return new Date(timestamp).toLocaleString("pt-BR");
}

function getMessageAttachments(message) {
	return [...message.attachments.values()];
}

/**
 * Gera transcrições TXT e HTML de um canal.
 *
 * @param {import("discord.js").TextBasedChannel} channel
 * @param {object} options
 * @param {string} options.closedBy
 * @param {string} options.directory
 * @param {number} options.messageLimit
 * @returns {Promise<{
 *   transcriptPathTxt: string,
 *   transcriptPathHtml: string,
 *   messageCount: number
 * } | null>}
 */
export async function createTicketTranscript(
	channel,
	{
		closedBy = "Desconhecido",
		directory = path.join(process.cwd(), "logs", "tickets"),
		messageLimit = 100,
	} = {},
) {
	if (!channel?.isTextBased() || !channel.messages) {
		return null;
	}

	try {
		mkdirSync(directory, { recursive: true });

		const collection = await channel.messages.fetch({
			limit: Math.min(Math.max(messageLimit, 1), 100),
		});

		const messages = [...collection.values()].sort(
			(a, b) => a.createdTimestamp - b.createdTimestamp,
		);

		const closedAt = new Date().toLocaleString("pt-BR");
		const creator = channel.name || "ticket";

		const header = [
			`Ticket: ${creator}`,
			`Canal: ${channel.id}`,
			`Fechado por: ${closedBy}`,
			`Fechado em: ${closedAt}`,
			`Mensagens: ${messages.length}`,
			"",
			"",
		].join("\n");

		const textLines = messages.map((message) => {
			const time = formatDate(message.createdTimestamp);
			const author =
				message.author?.tag ?? message.author?.username ?? "Desconhecido";

			const content = message.content || "";
			const attachments = getMessageAttachments(message);

			const attachmentText = attachments.length
				? ` [Anexos: ${attachments.map((item) => item.url).join(", ")}]`
				: "";

			return `[${time}] ${author}: ${content}${attachmentText}`;
		});

		const htmlMessages = messages.map((message) => {
			const time = formatDate(message.createdTimestamp);

			const authorName = escapeHtml(
				message.member?.displayName ||
					message.author?.globalName ||
					message.author?.username ||
					"Desconhecido",
			);

			const authorTag = escapeHtml(
				message.author?.tag ?? message.author?.username ?? "Desconhecido",
			);

			const avatar = escapeHtml(
				message.author?.displayAvatarURL({
					size: 128,
					extension: "png",
				}) ?? "",
			);

			const content = escapeHtml(message.content || "");

			const attachments = getMessageAttachments(message)
				.map((attachment) => {
					const url = escapeHtml(attachment.url);
					const name = escapeHtml(attachment.name || attachment.url);

					if (isImageUrl(attachment.url)) {
						return `
							<div class="attachment">
								<a href="${url}" target="_blank"
									 rel="noopener noreferrer">${name}</a>
								<img src="${url}" alt="${name}" />
							</div>
						`;
					}

					return `
						<div class="attachment">
							<a href="${url}" target="_blank"
								 rel="noopener noreferrer">${name}</a>
						</div>
					`;
				})
				.join("");

			return `
				<div class="message">
					<div class="meta">
						<img class="avatar" src="${avatar}"
								 alt="${authorName}" />
						<div class="author-info">
							<div class="author">${authorName}</div>
							<div class="author-tag">${authorTag}</div>
							<div class="timestamp">${escapeHtml(time)}</div>
						</div>
					</div>
					<div class="content">
						${content || "<em>Sem texto</em>"}
					</div>
					${attachments}
				</div>
			`;
		});

		const safeChannelName = sanitizeFileName(channel.name);
		const filePrefix = `${safeChannelName}-${channel.id}`;

		const transcriptPathTxt = path.join(directory, `${filePrefix}.txt`);

		const transcriptPathHtml = path.join(directory, `${filePrefix}.html`);

		const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>Transcrição de ${escapeHtml(channel.name)}</title>
	<style>
		body {
			font-family: Arial, sans-serif;
			background: #0f172a;
			color: #e2e8f0;
			margin: 0;
			padding: 24px;
		}
		.container {
			max-width: 900px;
			margin: 0 auto;
			background: #111827;
			border-radius: 16px;
			padding: 24px;
			box-shadow: 0 20px 60px rgba(15,23,42,.35);
		}
		.header { margin-bottom: 24px; }
		.header h1 { margin: 0 0 12px; font-size: 28px; }
		.header p { margin: 4px 0; color: #94a3b8; }
		.message {
			border-top: 1px solid rgba(148,163,184,.12);
			padding: 18px 0;
		}
		.meta {
			display: flex;
			align-items: center;
			gap: 12px;
			margin-bottom: 12px;
		}
		.avatar {
			width: 48px;
			height: 48px;
			border-radius: 50%;
			object-fit: cover;
			border: 2px solid #2563eb;
		}
		.author-info {
			display: flex;
			flex-direction: column;
			gap: 2px;
		}
		.author { color: #60a5fa; font-weight: 700; font-size: 16px; }
		.author-tag { color: #94a3b8; font-size: 13px; }
		.timestamp { color: #cbd5e1; font-size: 13px; }
		.content { white-space: pre-wrap; line-height: 1.65; }
		.attachment { margin-top: 12px; }
		.attachment img {
			display: block;
			max-width: 100%;
			border-radius: 12px;
			margin-top: 8px;
		}
		a { color: #7dd3fc; text-decoration: none; }
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			<h1>Transcrição do Ticket ${escapeHtml(channel.name)}</h1>
			<p>Canal: ${escapeHtml(channel.id)}</p>
			<p>Fechado por: ${escapeHtml(closedBy)}</p>
			<p>Fechado em: ${escapeHtml(closedAt)}</p>
			<p>Total de mensagens: ${messages.length}</p>
		</div>
		${htmlMessages.join("\n")}
	</div>
</body>
</html>`;

		await fwrite(transcriptPathTxt, header + textLines.join("\n"));
		await fwrite(transcriptPathHtml, htmlContent);

		return {
			transcriptPathTxt,
			transcriptPathHtml,
			messageCount: messages.length,
		};
	} catch (error) {
		console.error("[ticketTranscript] Erro ao gerar transcrição:", error);
		return null;
	}
}

/**
 * Envia os arquivos de transcrição para um canal de logs.
 *
 * @param {import("discord.js").Client} client
 * @param {object | null} transcriptData
 * @param {object} options
 * @param {string} options.channelId
 * @param {string} options.ticketName
 */
export async function sendTicketTranscriptToLog(
	client,
	transcriptData,
	{ channelId, ticketName = "sem nome" } = {},
) {
	if (!channelId || !transcriptData) {
		return false;
	}

	try {
		const logChannel = await client.channels.fetch(channelId);

		if (!logChannel?.isTextBased() || typeof logChannel.send !== "function") {
			console.warn("[ticketTranscript] Canal de logs inválido.");
			return false;
		}

		const files = [];

		for (const filePath of [
			transcriptData.transcriptPathTxt,
			transcriptData.transcriptPathHtml,
		]) {
			if (filePath && existsSync(filePath)) {
				files.push(
					new AttachmentBuilder(filePath, {
						name: path.basename(filePath),
					}),
				);
			}
		}

		if (!files.length) {
			return false;
		}

		await logChannel.send({
			content: `Transcrição do ticket fechado: **${ticketName}**`,
			files,
		});

		return true;
	} catch (error) {
		console.error("[ticketTranscript] Erro ao enviar transcrição:", error);
		return false;
	}
}
