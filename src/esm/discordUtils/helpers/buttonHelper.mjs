// @ts-check

import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

/**
 * @typedef {import("discord.js").ButtonInteraction} ButtonInteraction
 */

/**
 * @typedef {(interaction: ButtonInteraction) => Promise<void> | void} ButtonHandler
 */

/** @type {Map<string, ButtonHandler>} */
const buttonHandlers = new Map();

/**
 * Valida um customId.
 * @param {string} customId Identificador do botão.
 * @returns {string} Identificador validado.
 */
function validateCustomId(customId) {
	if (
		typeof customId !== "string" ||
		customId.length < 1 ||
		customId.length > 100
	) {
		throw new TypeError("customId deve conter de 1 a 100 caracteres.");
	}

	return customId;
}

/**
 * Registra ou substitui o handler de um botão.
 *
 * @param {string} customId Identificador do botão.
 * @param {ButtonHandler} handler Função executada ao clicar.
 * @returns {void}
 */
export function registerButtonHandler(customId, handler) {
	validateCustomId(customId);

	if (typeof handler !== "function") {
		throw new TypeError("handler deve ser uma função.");
	}

	buttonHandlers.set(customId, handler);
}

/**
 * Remove um handler registrado.
 *
 * @param {string} customId Identificador do botão.
 * @returns {boolean} Indica se um handler foi removido.
 */
export function unregisterButtonHandler(customId) {
	return buttonHandlers.delete(validateCustomId(customId));
}

/**
 * Verifica se existe um handler registrado.
 *
 * @param {string} customId Identificador do botão.
 * @returns {boolean} Indica se o handler existe.
 */
export function hasButtonHandler(customId) {
	return buttonHandlers.has(validateCustomId(customId));
}

/**
 * Processa uma interação de botão.
 *
 * Retorna false quando não existe handler registrado.
 * Os erros do callback são propagados para o dispatcher central.
 *
 * @param {import("discord.js").Interaction} interaction Interação recebida.
 * @returns {Promise<boolean>} Indica se a interação foi processada.
 */
export async function handleButton(interaction) {
	if (!interaction.isButton()) {
		return false;
	}

	const handler = buttonHandlers.get(interaction.customId);

	if (!handler) {
		return false;
	}

	await handler(interaction);

	return true;
}

/**
 * Cria um botão interativo.
 *
 * @param {object} options Opções do botão.
 * @param {string} options.customId Identificador interno.
 * @param {string} options.label Texto exibido.
 * @param {ButtonStyle} [options.style] Estilo visual.
 * @param {string} [options.emoji] Emoji.
 * @param {boolean} [options.disabled] Desabilita o botão.
 * @returns {ButtonBuilder} Botão configurado.
 */
export function createButton({
	customId,
	label,
	style = ButtonStyle.Primary,
	emoji,
	disabled = false,
}) {
	validateCustomId(customId);

	if (typeof label !== "string" || label.length < 1 || label.length > 80) {
		throw new TypeError("label deve conter de 1 a 80 caracteres.");
	}

	if (!Object.values(ButtonStyle).includes(style)) {
		throw new TypeError("Estilo de botão inválido.");
	}

	if (style === ButtonStyle.Link || style === ButtonStyle.Premium) {
		throw new TypeError(
			"Use createLinkButton() para links. Botões Premium exigem configuração própria.",
		);
	}

	const button = new ButtonBuilder()
		.setCustomId(customId)
		.setLabel(label)
		.setStyle(style)
		.setDisabled(disabled);

	if (emoji) {
		button.setEmoji(emoji);
	}

	return button;
}

/**
 * Cria um botão de link HTTPS.
 *
 * Botões de link não disparam interações e não precisam de handler.
 *
 * @param {string} url Endereço HTTPS.
 * @param {string} label Texto do botão.
 * @param {string} [emoji] Emoji.
 * @returns {ButtonBuilder} Botão de link.
 */
export function createLinkButton(url, label, emoji) {
	let parsedURL;

	try {
		parsedURL = new URL(url);
	} catch {
		throw new TypeError("URL inválida.");
	}

	if (
		parsedURL.protocol !== "https:" ||
		parsedURL.username ||
		parsedURL.password
	) {
		throw new TypeError("A URL deve ser HTTPS e não conter credenciais.");
	}

	if (typeof label !== "string" || label.length < 1 || label.length > 80) {
		throw new TypeError("label deve conter de 1 a 80 caracteres.");
	}

	const button = new ButtonBuilder()
		.setLabel(label)
		.setStyle(ButtonStyle.Link)
		.setURL(parsedURL.href);

	if (emoji) {
		button.setEmoji(emoji);
	}

	return button;
}

/**
 * Agrupa de 1 a 5 botões em uma linha de ação.
 *
 * @param {ButtonBuilder[]} buttons Botões.
 * @returns {ActionRowBuilder<ButtonBuilder>} Linha configurada.
 */
export function createButtonRow(buttons) {
	if (!Array.isArray(buttons) || buttons.length < 1 || buttons.length > 5) {
		throw new RangeError("Uma linha de ação aceita de 1 a 5 botões.");
	}

	return new ActionRowBuilder().addComponents(...buttons);
}

/**
 * Cria um botão secundário desabilitado.
 *
 * @param {string} customId Identificador.
 * @param {string} label Texto.
 * @returns {ButtonBuilder} Botão desabilitado.
 */
export function createDisabledButton(customId, label) {
	return createButton({
		customId,
		label,
		style: ButtonStyle.Secondary,
		disabled: true,
	});
}

export { ButtonStyle };
