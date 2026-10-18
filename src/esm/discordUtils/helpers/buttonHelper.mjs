
 // @ts-check

import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} from "discord.js";

/**
 * @typedef {import("discord.js").ButtonInteraction} ButtonInteraction
 */

/**
 * @typedef {(interaction: ButtonInteraction) => Promise<void> | void} ButtonHandler
 */

/** @type {Map<string, ButtonHandler>} */
const buttonHandlers = new Map();

/**
 * Valida um objeto de opções.
 * @param {unknown} options
 * @param {string} name
 * @returns {Record<string, unknown>}
 */
function validateOptionsObject(options, name = "options") {
    if (
        options === null ||
        typeof options !== "object" ||
        Array.isArray(options)
    ) {
        throw new TypeError(`${name} deve ser um objeto válido.`);
    }

    return /** @type {Record<string, unknown>} */ (options);
}

/**
 * Valida um texto obrigatório.
 * @param {unknown} value
 * @param {string} name
 * @param {number} maxLength
 * @returns {string}
 */
function validateText(value, name, maxLength) {
    if (
        typeof value !== "string" ||
        value.trim().length === 0 ||
        value.length > maxLength
    ) {
        throw new TypeError(
            `${name} deve conter de 1 a ${maxLength} caracteres e não pode ser vazio.`,
        );
    }

    return value;
}

/**
 * Valida um customId.
 * @param {unknown} customId
 * @returns {string}
 */
function validateCustomId(customId) {
    return validateText(customId, "customId", 100);
}

/**
 * Valida um booleano.
 * @param {unknown} value
 * @param {string} name
 * @returns {boolean}
 */
function validateBoolean(value, name) {
    if (typeof value !== "boolean") {
        throw new TypeError(`${name} deve ser boolean.`);
    }

    return value;
}

/**
 * Valida um estilo de botão interativo.
 * @param {unknown} style
 * @returns {ButtonStyle}
 */
function validateInteractiveStyle(style) {
    if (
        typeof style !== "number" ||
        !Object.values(ButtonStyle).includes(style) ||
        style === ButtonStyle.Link ||
        style === ButtonStyle.Premium
    ) {
        throw new TypeError(
            "Estilo inválido. Botões interativos não aceitam Link ou Premium.",
        );
    }

    return /** @type {ButtonStyle} */ (style);
}

/**
 * Aplica e valida um emoji opcional.
 * @param {ButtonBuilder} button
 * @param {unknown} emoji
 * @returns {void}
 */
function applyEmoji(button, emoji) {
    if (emoji === undefined || emoji === null) {
        return;
    }

    if (
        typeof emoji !== "string" &&
        (typeof emoji !== "object" || Array.isArray(emoji))
    ) {
        throw new TypeError("emoji deve ser uma string ou um objeto de emoji.");
    }

    if (typeof emoji === "string" && emoji.trim().length === 0) {
        throw new TypeError("emoji não pode ser uma string vazia.");
    }

    try {
        button.setEmoji(
            /** @type {import("discord.js").ComponentEmojiResolvable} */ (emoji),
        );
    } catch (error) {
        throw new TypeError(
            "Emoji inválido para o botão.",
            { cause: error },
        );
    }
}

/**
 * Valida um ButtonBuilder.
 * @param {unknown} button
 * @returns {ButtonBuilder}
 */
function validateButtonBuilder(button) {
    if (!(button instanceof ButtonBuilder)) {
        throw new TypeError("Todos os itens devem ser instâncias de ButtonBuilder.");
    }

    try {
        button.toJSON();
    } catch (error) {
        throw new TypeError("O botão contém dados inválidos.", {
            cause: error,
        });
    }

    return button;
}

/**
 * Registra um handler para um botão.
 *
 * @param {string} customId Identificador do botão.
 * @param {ButtonHandler} handler Função executada ao clicar.
 * @param {{replace?: boolean}} [options] Permite substituir um handler existente.
 * @returns {void}
 */
export function registerButtonHandler(customId, handler, options = {}) {
    validateCustomId(customId);

    if (typeof handler !== "function") {
        throw new TypeError("handler deve ser uma função.");
    }

    const opts = validateOptionsObject(options);

    if (opts.replace !== undefined && typeof opts.replace !== "boolean") {
        throw new TypeError("options.replace deve ser boolean.");
    }

    if (buttonHandlers.has(customId) && opts.replace !== true) {
        throw new Error(
            `Já existe um handler registrado para o customId "${customId}". Use { replace: true } para substituí-lo.`,
        );
    }

    buttonHandlers.set(customId, handler);
}

/**
 * Remove um handler registrado.
 * @param {string} customId Identificador do botão.
 * @returns {boolean}
 */
export function unregisterButtonHandler(customId) {
    return buttonHandlers.delete(validateCustomId(customId));
}

/**
 * Verifica se um handler está registrado.
 * @param {string} customId Identificador do botão.
 * @returns {boolean}
 */
export function hasButtonHandler(customId) {
    return buttonHandlers.has(validateCustomId(customId));
}

/**
 * Processa uma interação de botão.
 * Retorna false se não for um botão ou não houver handler.
 * Os erros do handler são propagados ao dispatcher.
 *
 * @param {import("discord.js").Interaction} interaction
 * @returns {Promise<boolean>}
 */
export async function handleButton(interaction) {
    if (
        !interaction ||
        typeof interaction.isButton !== "function" ||
        !interaction.isButton()
    ) {
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
 * @param {{
 *   customId: string,
 *   label: string,
 *   style?: ButtonStyle,
 *   emoji?: import("discord.js").ComponentEmojiResolvable,
 *   disabled?: boolean
 * }} options
 * @returns {ButtonBuilder}
 */
export function createButton(options) {
    const opts = validateOptionsObject(options);

    const customId = validateCustomId(opts.customId);
    const label = validateText(opts.label, "label", 80);
    const style = validateInteractiveStyle(
        opts.style === undefined ? ButtonStyle.Primary : opts.style,
    );
    const disabled =
        opts.disabled === undefined
            ? false
            : validateBoolean(opts.disabled, "disabled");

    const button = new ButtonBuilder()
        .setCustomId(customId)
        .setLabel(label)
        .setStyle(style)
        .setDisabled(disabled);

    applyEmoji(button, opts.emoji);

    return validateButtonBuilder(button);
}

/**
 * Cria um botão de link HTTPS.
 * Botões de link não geram interações.
 *
 * @param {string} url Endereço HTTPS.
 * @param {string} label Texto do botão.
 * @param {import("discord.js").ComponentEmojiResolvable} [emoji] Emoji opcional.
 * @returns {ButtonBuilder}
 */
export function createLinkButton(url, label, emoji) {
    if (typeof url !== "string" || url.trim().length === 0) {
        throw new TypeError("url deve ser uma string válida.");
    }

    let parsedURL;

    try {
        parsedURL = new URL(url);
    } catch (error) {
        throw new TypeError("URL inválida.", { cause: error });
    }

    if (
        parsedURL.protocol !== "https:" ||
        parsedURL.username.length > 0 ||
        parsedURL.password.length > 0
    ) {
        throw new TypeError(
            "A URL deve usar HTTPS e não conter credenciais.",
        );
    }

    const validatedLabel = validateText(label, "label", 80);

    const button = new ButtonBuilder()
        .setLabel(validatedLabel)
        .setStyle(ButtonStyle.Link)
        .setURL(parsedURL.href);

    applyEmoji(button, emoji);

    return validateButtonBuilder(button);
}

/**
 * Agrupa de 1 a 5 botões em uma linha de ação.
 *
 * @param {ButtonBuilder[]} buttons
 * @returns {ActionRowBuilder<ButtonBuilder>}
 */
export function createButtonRow(buttons) {
    if (!Array.isArray(buttons) || buttons.length < 1 || buttons.length > 5) {
        throw new RangeError("Uma linha de ação aceita de 1 a 5 botões.");
    }

    const validatedButtons = buttons.map(validateButtonBuilder);

    return new ActionRowBuilder()
        .addComponents(...validatedButtons);
}

/**
 * Cria um botão secundário desabilitado.
 *
 * @param {string} customId Identificador.
 * @param {string} label Texto.
 * @returns {ButtonBuilder}
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