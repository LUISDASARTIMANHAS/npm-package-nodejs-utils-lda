
 // @ts-check

import {
	ModalBuilder,
	LabelBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";

const PREFIX = "[LDA MODAL]";

/**
 * Valida um objeto de opções.
 * @param {unknown} options
 * @param {string} name
 * @returns {Record<string, unknown>}
 */
function validateOptions(options, name) {
	if (
		options === null ||
		typeof options !== "object" ||
		Array.isArray(options)
	) {
		throw new TypeError(`${PREFIX} ${name} deve ser um objeto válido.`);
	}

	return /** @type {Record<string, unknown>} */ (options);
}

/**
 * Valida um customId.
 * @param {unknown} value
 * @param {string} [name]
 * @returns {string}
 */
function validateCustomId(value, name = "customId") {
	if (
		typeof value !== "string" ||
		value.trim().length < 1 ||
		value.length > 100
	) {
		throw new TypeError(
			`${PREFIX} "${name}" deve conter de 1 a 100 caracteres.`,
		);
	}

	return value;
}

/**
 * Valida um texto obrigatório.
 * @param {unknown} value
 * @param {string} name
 * @param {number} maxLength
 * @param {number} [minLength]
 * @returns {string}
 */
function validateText(value, name, maxLength, minLength = 1) {
	if (
		typeof value !== "string" ||
		value.trim().length < minLength ||
		value.length > maxLength
	) {
		throw new TypeError(
			`${PREFIX} "${name}" deve conter de ${minLength} a ${maxLength} caracteres.`,
		);
	}

	return value;
}

/**
 * Valida um texto opcional.
 * @param {unknown} value
 * @param {string} name
 * @param {number} maxLength
 * @returns {string|undefined}
 */
function validateOptionalText(value, name, maxLength) {
	if (value === undefined || value === null) {
		return undefined;
	}

	return validateText(value, name, maxLength);
}

/**
 * Valida os limites de um campo.
 * @param {unknown} minLength
 * @param {unknown} maxLength
 */
function validateLengths(minLength, maxLength) {
	if (
		!Number.isInteger(maxLength) ||
		/** @type {number} */ (maxLength) < 1 ||
		/** @type {number} */ (maxLength) > 4000
	) {
		throw new RangeError(
			`${PREFIX} maxLength deve ser um inteiro entre 1 e 4000.`,
		);
	}

	if (
		minLength !== undefined &&
		(
			!Number.isInteger(minLength) ||
			/** @type {number} */ (minLength) < 0 ||
			/** @type {number} */ (minLength) >
				/** @type {number} */ (maxLength)
		)
	) {
		throw new RangeError(
			`${PREFIX} minLength deve ser um inteiro entre 0 e maxLength.`,
		);
	}
}

/**
 * Cria um campo de texto para um modal.
 *
 * @param {object} options
 * @param {string} options.customId
 * @param {string} options.label
 * @param {string} [options.placeholder]
 * @param {import("discord.js").TextInputStyle} [options.style]
 * @param {boolean} [options.required]
 * @param {number} [options.minLength]
 * @param {number} [options.maxLength]
 * @param {string} [options.value]
 * @param {string} [options.description]
 * @returns {LabelBuilder}
 */
export function createTextInput(options) {
	const opts = validateOptions(options, "options");

	const customId = validateCustomId(opts.customId);
	const label = validateText(opts.label, "label", 45);

	const placeholder = validateOptionalText(
		opts.placeholder,
		"placeholder",
		100,
	);

	const description = validateOptionalText(
		opts.description,
		"description",
		100,
	);

	const style = opts.style ?? TextInputStyle.Short;
	const required = opts.required ?? true;
	const maxLength = opts.maxLength ?? 4000;
	const minLength = opts.minLength;

	if (
		style !== TextInputStyle.Short &&
		style !== TextInputStyle.Paragraph
	) {
		throw new TypeError(
			`${PREFIX} style deve ser TextInputStyle.Short ou TextInputStyle.Paragraph.`,
		);
	}

	if (typeof required !== "boolean") {
		throw new TypeError(`${PREFIX} required deve ser boolean.`);
	}

	validateLengths(minLength, maxLength);

	if (opts.value !== undefined && opts.value !== null) {
		validateText(
			opts.value,
			"value",
			/** @type {number} */ (maxLength),
		);

		if (
			minLength !== undefined &&
			/** @type {string} */ (opts.value).length <
				/** @type {number} */ (minLength)
		) {
			throw new RangeError(
				`${PREFIX} value é menor que minLength.`,
			);
		}
	}

	const input = new TextInputBuilder()
		.setCustomId(customId)
		.setStyle(style)
		.setRequired(required)
		.setMaxLength(/** @type {number} */ (maxLength));

	if (minLength !== undefined) {
		input.setMinLength(/** @type {number} */ (minLength));
	}

	if (placeholder !== undefined) {
		input.setPlaceholder(placeholder);
	}

	if (opts.value !== undefined && opts.value !== null) {
		input.setValue(/** @type {string} */ (opts.value));
	}

	const labelBuilder = new LabelBuilder()
		.setLabel(label)
		.setTextInputComponent(input);

	if (description !== undefined) {
		labelBuilder.setDescription(description);
	}

	return labelBuilder;
}

/**
 * Valida os campos de um modal e impede IDs duplicados.
 * @param {unknown} fields
 * @returns {LabelBuilder[]}
 */
function validateFields(fields) {
	if (!Array.isArray(fields)) {
		throw new TypeError(`${PREFIX} fields deve ser um array.`);
	}

	if (fields.length < 1 || fields.length > 5) {
		throw new RangeError(
			`${PREFIX} um modal deve conter de 1 a 5 campos.`,
		);
	}

	const ids = new Set();

	for (const [index, field] of fields.entries()) {
		if (!(field instanceof LabelBuilder)) {
			throw new TypeError(
				`${PREFIX} fields[${index}] deve ser um LabelBuilder criado pela biblioteca.`,
			);
		}

		let json;

		try {
			json = field.toJSON();
		} catch (error) {
			throw new TypeError(
				`${PREFIX} fields[${index}] é inválido: ${
					error instanceof Error ? error.message : String(error)
				}`,
				{ cause: error },
			);
		}

		const inputId = json.component?.custom_id;

		validateCustomId(inputId, `fields[${index}].customId`);

		if (ids.has(inputId)) {
			throw new TypeError(
				`${PREFIX} customId duplicado no modal: "${inputId}".`,
			);
		}

		ids.add(inputId);
	}

	return fields;
}

/**
 * Cria um modal com de 1 a 5 campos.
 *
 * @param {object} options
 * @param {string} options.customId
 * @param {string} options.title
 * @param {LabelBuilder[]} options.fields
 * @returns {ModalBuilder}
 */
export function createModal(options) {
	const opts = validateOptions(options, "options");

	const customId = validateCustomId(opts.customId);
	const title = validateText(opts.title, "title", 45);
	const fields = validateFields(opts.fields);

	const modal = new ModalBuilder()
		.setCustomId(customId)
		.setTitle(title)
		.addLabelComponents(...fields);

	// Verifica se o modal completo pode ser serializado.
	try {
		modal.toJSON();
	} catch (error) {
		throw new TypeError(
			`${PREFIX} não foi possível montar o modal: ${
				error instanceof Error ? error.message : String(error)
			}`,
			{ cause: error },
		);
	}

	return modal;
}

/**
 * Obtém o valor de um campo enviado.
 *
 * @param {import("discord.js").ModalSubmitInteraction} interaction
 * @param {string} customId
 * @param {boolean} [trim]
 * @returns {string}
 */
export function getModalValue(interaction, customId, trim = true) {
	if (
		!interaction ||
		typeof interaction.isModalSubmit !== "function" ||
		!interaction.isModalSubmit()
	) {
		throw new TypeError(
			`${PREFIX} interaction deve ser um envio válido de modal.`,
		);
	}

	validateCustomId(customId);

	if (typeof trim !== "boolean") {
		throw new TypeError(`${PREFIX} trim deve ser boolean.`);
	}

	let value;

	try {
		value = interaction.fields.getTextInputValue(customId);
	} catch (error) {
		throw new Error(
			`${PREFIX} não foi possível ler o campo "${customId}". ` +
			"Verifique se ele existe no modal enviado.",
			{ cause: error },
		);
	}

	if (typeof value !== "string") {
		throw new TypeError(
			`${PREFIX} o campo "${customId}" não retornou uma string.`,
		);
	}

	return trim ? value.trim() : value;
}

/**
 * Lê vários campos de um modal.
 *
 * @param {import("discord.js").ModalSubmitInteraction} interaction
 * @param {string[]} fieldIds
 * @returns {Record<string, string>}
 */
export function getModalValues(interaction, fieldIds) {
	if (!Array.isArray(fieldIds)) {
		throw new TypeError(`${PREFIX} fieldIds deve ser um array.`);
	}

	const ids = fieldIds.map((id, index) =>
		validateCustomId(id, `fieldIds[${index}]`),
	);

	if (new Set(ids).size !== ids.length) {
		throw new TypeError(
			`${PREFIX} fieldIds não pode conter identificadores duplicados.`,
		);
	}

	return Object.fromEntries(
		ids.map((id) => [id, getModalValue(interaction, id)]),
	);
}

/**
 * @typedef {(interaction: import("discord.js").ModalSubmitInteraction) => unknown | Promise<unknown>} ModalHandler
 */

/** @type {Map<string, ModalHandler>} */
const modalHandlers = new Map();

/**
 * Registra um handler para um modal.
 * Por padrão, impede sobrescrever um registro existente.
 *
 * @param {string} customId
 * @param {ModalHandler} handler
 * @param {{ replace?: boolean }} [options]
 */
export function registerModalHandler(customId, handler, options = {}) {
	validateCustomId(customId);

	if (typeof handler !== "function") {
		throw new TypeError(`${PREFIX} handler deve ser uma função.`);
	}

	const opts = validateOptions(options, "options");

	if (
		opts.replace !== undefined &&
		typeof opts.replace !== "boolean"
	) {
		throw new TypeError(`${PREFIX} replace deve ser boolean.`);
	}

	if (modalHandlers.has(customId) && opts.replace !== true) {
		throw new Error(
			`${PREFIX} já existe um handler registrado para "${customId}". ` +
			"Utilize { replace: true } para substituí-lo intencionalmente.",
		);
	}

	modalHandlers.set(customId, handler);
}

/**
 * Remove um handler registrado.
 * @param {string} customId
 * @returns {boolean}
 */
export function unregisterModalHandler(customId) {
	validateCustomId(customId);
	return modalHandlers.delete(customId);
}

/**
 * Verifica se um handler está registrado.
 * @param {string} customId
 * @returns {boolean}
 */
export function hasModalHandler(customId) {
	validateCustomId(customId);
	return modalHandlers.has(customId);
}

/**
 * Processa uma interação de modal registrada.
 * Erros do handler são propagados com contexto.
 *
 * @param {import("discord.js").Interaction} interaction
 * @returns {Promise<boolean>}
 */
export async function handleModal(interaction) {
	if (
		!interaction ||
		typeof interaction.isModalSubmit !== "function"
	) {
		throw new TypeError(
			`${PREFIX} interaction não é uma interação Discord válida.`,
		);
	}

	if (!interaction.isModalSubmit()) {
		return false;
	}

	const handler = modalHandlers.get(interaction.customId);

	if (!handler) {
		return false;
	}

	try {
		await handler(interaction);
	} catch (error) {
		throw new Error(
			`${PREFIX} o handler do modal "${interaction.customId}" falhou: ${
				error instanceof Error ? error.message : String(error)
			}`,
			{ cause: error },
		);
	}

	return true;
}

export { TextInputStyle };