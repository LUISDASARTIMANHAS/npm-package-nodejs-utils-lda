
 // @ts-check

import {
	ModalBuilder,
	LabelBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";

/**
 * Valida um identificador de componente do Discord.
 * @param {string} value Identificador.
 * @param {string} name Nome do parâmetro.
 * @returns {string} Identificador validado.
 */
function validateCustomId(value, name = "customId") {
	if (
		typeof value !== "string" ||
		value.length < 1 ||
		value.length > 100
	) {
		throw new TypeError(
			`${name} deve conter entre 1 e 100 caracteres.`,
		);
	}

	return value;
}

/**
 * Valida um texto não vazio com limite máximo.
 * @param {string} value Texto.
 * @param {string} name Nome do parâmetro.
 * @param {number} maxLength Limite máximo.
 * @returns {string} Texto validado.
 */
function validateText(value, name, maxLength) {
	if (
		typeof value !== "string" ||
		value.trim().length === 0 ||
		value.length > maxLength
	) {
		throw new TypeError(
			`${name} deve conter de 1 a ${maxLength} caracteres.`,
		);
	}

	return value;
}

/**
 * Cria um campo de texto para um formulário modal.
 *
 * @param {object} options Configurações do campo.
 * @param {string} options.customId Identificador único do campo.
 * @param {string} options.label Rótulo exibido.
 * @param {string} [options.placeholder] Texto de exemplo.
 * @param {TextInputStyle} [options.style] Estilo do campo.
 * @param {boolean} [options.required] Campo obrigatório.
 * @param {number} [options.minLength] Comprimento mínimo.
 * @param {number} [options.maxLength] Comprimento máximo.
 * @param {string} [options.value] Valor inicial.
 * @param {string} [options.description] Descrição auxiliar.
 * @returns {LabelBuilder} Campo pronto para o modal.
 */
export function createTextInput({
	customId,
	label,
	placeholder,
	style = TextInputStyle.Short,
	required = true,
	minLength,
	maxLength = 4000,
	value,
	description,
}) {
	validateCustomId(customId);
	validateText(label, "label", 45);

	if (
		!Number.isInteger(maxLength) ||
		maxLength < 1 ||
		maxLength > 4000
	) {
		throw new RangeError("maxLength deve estar entre 1 e 4000.");
	}

	if (
		minLength !== undefined &&
		(!Number.isInteger(minLength) ||
			minLength < 0 ||
			minLength > maxLength)
	) {
		throw new RangeError("minLength inválido.");
	}

	if (value !== undefined && value.length > maxLength) {
		throw new RangeError("O valor inicial excede maxLength.");
	}

	if (
		placeholder !== undefined &&
		(placeholder.length < 1 || placeholder.length > 100)
	) {
		throw new RangeError("placeholder deve ter até 100 caracteres.");
	}

	const input = new TextInputBuilder()
		.setCustomId(customId)
		.setStyle(style)
		.setRequired(required)
		.setMaxLength(maxLength);

	if (minLength !== undefined) {
		input.setMinLength(minLength);
	}

	if (placeholder !== undefined) {
		input.setPlaceholder(placeholder);
	}

	if (value !== undefined) {
		input.setValue(value);
	}

	const labelBuilder = new LabelBuilder()
		.setLabel(label)
		.setTextInputComponent(input);

	if (description) {
		labelBuilder.setDescription(description);
	}

	return labelBuilder;
}

/**
 * Cria um formulário modal com até cinco campos.
 *
 * @param {object} options Configurações do formulário.
 * @param {string} options.customId Identificador do modal.
 * @param {string} options.title Título do formulário.
 * @param {LabelBuilder[]} [options.fields] Campos do formulário.
 * @returns {ModalBuilder} Modal pronto para exibição.
 */
export function createModal({
	customId,
	title,
	fields = [],
}) {
	validateCustomId(customId);
	validateText(title, "title", 45);

	if (!Array.isArray(fields) || fields.length > 5) {
		throw new RangeError(
			"Um modal aceita no máximo cinco campos.",
		);
	}

	return new ModalBuilder()
		.setCustomId(customId)
		.setTitle(title)
		.addLabelComponents(...fields);
}

/**
 * Obtém e normaliza o conteúdo de um campo enviado.
 *
 * @param {import("discord.js").ModalSubmitInteraction} interaction
 * Interação de envio do modal.
 * @param {string} customId Identificador do campo.
 * @param {boolean} [trim] Remove espaços externos.
 * @returns {string} Conteúdo enviado.
 */
export function getModalValue(
	interaction,
	customId,
	trim = true,
) {
	const value = interaction.fields.getTextInputValue(customId);

	return trim ? value.trim() : value;
}

/**
 * Lê vários campos de um modal em um objeto.
 *
 * @param {import("discord.js").ModalSubmitInteraction} interaction
 * Interação enviada.
 * @param {string[]} fieldIds Identificadores dos campos.
 * @returns {Record<string, string>} Valores por identificador.
 */
export function getModalValues(interaction, fieldIds) {
	if (!Array.isArray(fieldIds)) {
		throw new TypeError("fieldIds deve ser um array.");
	}

	return Object.fromEntries(
		fieldIds.map((id) => [
			id,
			getModalValue(interaction, id),
		]),
	);
}


/** @type {Map<string, (interaction: import("discord.js").ModalSubmitInteraction) => Promise<void>>} */
const modalHandlers = new Map();

/**
 * Registra o handler de um formulário.
 * @param {string} customId Identificador do formulário.
 * @param {(interaction: import("discord.js").ModalSubmitInteraction) => Promise<void>} handler Função executada no envio.
 * @returns {void}
 */
export function registerModalHandler(customId, handler) {
  validateCustomId(customId);

  if (typeof handler !== "function") {
    throw new TypeError("handler deve ser uma função.");
  }

  modalHandlers.set(customId, handler);
}

/**
 * Processa uma interação de formulário registrada.
 * @param {import("discord.js").Interaction} interaction Interação recebida.
 * @returns {Promise<boolean>} Indica se a interação foi processada.
 */
export async function handleModal(interaction) {
  if (!interaction.isModalSubmit()) return false;

  const handler = modalHandlers.get(interaction.customId);

  if (!handler) return false;

  await handler(interaction);
  return true;
}

export { TextInputStyle };
