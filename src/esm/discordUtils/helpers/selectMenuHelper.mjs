
 // @ts-check

import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  UserSelectMenuBuilder,
  RoleSelectMenuBuilder,
  ChannelSelectMenuBuilder,
  MentionableSelectMenuBuilder,
  ChannelType,
} from "discord.js";

const PREFIX = "[LDA SELECT MENU]";

/**
 * Valida um objeto de opções.
 * @param {unknown} value
 * @param {string} name
 * @returns {Record<string, unknown>}
 */
function validateOptionsObject(value, name = "options") {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    throw new TypeError(`${PREFIX} "${name}" deve ser um objeto válido.`);
  }

  return /** @type {Record<string, unknown>} */ (value);
}

/**
 * Valida um identificador de componente.
 * @param {unknown} customId
 * @param {string} [name]
 * @returns {string}
 */
function validateCustomId(customId, name = "customId") {
  if (
    typeof customId !== "string" ||
    customId.trim().length < 1 ||
    customId.length > 100
  ) {
    throw new TypeError(
      `${PREFIX} "${name}" deve conter de 1 a 100 caracteres.`,
    );
  }

  return customId;
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
      `${PREFIX} "${name}" deve conter de 1 a ${maxLength} caracteres.`,
    );
  }

  return value;
}

/**
 * Valida um booleano.
 * @param {unknown} value
 * @param {string} name
 * @returns {boolean}
 */
function validateBoolean(value, name) {
  if (typeof value !== "boolean") {
    throw new TypeError(`${PREFIX} "${name}" deve ser boolean.`);
  }

  return value;
}

/**
 * Valida os limites de seleção.
 * @param {unknown} minValues
 * @param {unknown} maxValues
 * @param {number} limit
 * @returns {{minValues: number, maxValues: number}}
 */
function validateSelectionLimits(minValues, maxValues, limit) {
  if (
    !Number.isInteger(minValues) ||
    !Number.isInteger(maxValues) ||
    /** @type {number} */ (minValues) < 0 ||
    /** @type {number} */ (maxValues) < 1 ||
    /** @type {number} */ (minValues) >
      /** @type {number} */ (maxValues) ||
    /** @type {number} */ (maxValues) > limit
  ) {
    throw new RangeError(
      `${PREFIX} minValues e maxValues devem ser inteiros válidos, ` +
      `com 0 <= minValues <= maxValues <= ${limit}.`,
    );
  }

  return {
    minValues: /** @type {number} */ (minValues),
    maxValues: /** @type {number} */ (maxValues),
  };
}

/**
 * Valida configurações compartilhadas pelos menus de entidades.
 * @param {unknown} options
 */
function getEntityMenuOptions(options) {
  const opts = validateOptionsObject(options);

  const customId = validateCustomId(opts.customId);
  const placeholder =
    opts.placeholder === undefined || opts.placeholder === null
      ? undefined
      : validateText(opts.placeholder, "placeholder", 150);

  const minValues = opts.minValues ?? 1;
  const maxValues = opts.maxValues ?? 1;
  const disabled = opts.disabled ?? false;

  const limits = validateSelectionLimits(minValues, maxValues, 25);
  validateBoolean(disabled, "disabled");

  return {
    customId,
    placeholder,
    ...limits,
    disabled,
  };
}

/**
 * Valida a serialização de um builder.
 * @param {object} builder
 * @param {string} name
 */
function validateBuilder(builder, name) {
  try {
    if (typeof builder.toJSON !== "function") {
      throw new TypeError("O builder não possui toJSON().");
    }

    const json = builder.toJSON();

    if (
      !json ||
      typeof json !== "object" ||
      !Number.isInteger(json.type)
    ) {
      throw new TypeError("O builder não produziu um componente válido.");
    }
  } catch (error) {
    throw new TypeError(
      `${PREFIX} "${name}" é inválido: ${
        error instanceof Error ? error.message : String(error)
      }`,
      { cause: error },
    );
  }
}

/**
 * Cria um menu de seleção de texto.
 *
 * @param {object} options
 * @param {string} options.customId
 * @param {Array<{label: string, value: string, description?: string, emoji?: import("discord.js").ComponentEmojiResolvable, default?: boolean}>} options.options
 * @param {string} [options.placeholder]
 * @param {number} [options.minValues]
 * @param {number} [options.maxValues]
 * @param {boolean} [options.disabled]
 * @returns {StringSelectMenuBuilder}
 */
export function createStringSelectMenu(options) {
  const opts = validateOptionsObject(options);

  const customId = validateCustomId(opts.customId);

  if (!Array.isArray(opts.options)) {
    throw new TypeError(`${PREFIX} "options" deve ser um array.`);
  }

  const choices = opts.options;

  if (choices.length < 1 || choices.length > 25) {
    throw new RangeError(
      `${PREFIX} um menu de texto deve conter de 1 a 25 opções.`,
    );
  }

  const minValues = opts.minValues ?? 1;
  const maxValues = opts.maxValues ?? 1;
  const disabled = opts.disabled ?? false;

  const limits = validateSelectionLimits(
    minValues,
    maxValues,
    choices.length,
  );

  validateBoolean(disabled, "disabled");

  const placeholder =
    opts.placeholder === undefined || opts.placeholder === null
      ? undefined
      : validateText(opts.placeholder, "placeholder", 150);

  const seenValues = new Set();

  const menuOptions = choices.map((choice, index) => {
    const option = validateOptionsObject(
      choice,
      `options[${index}]`,
    );

    const label = validateText(option.label, `options[${index}].label`, 100);
    const value = validateText(option.value, `options[${index}].value`, 100);

    if (seenValues.has(value)) {
      throw new TypeError(
        `${PREFIX} valor duplicado na opção ${index}: "${value}".`,
      );
    }

    seenValues.add(value);

    const description =
      option.description === undefined || option.description === null
        ? undefined
        : validateText(
            option.description,
            `options[${index}].description`,
            100,
          );

    if (
      option.default !== undefined &&
      typeof option.default !== "boolean"
    ) {
      throw new TypeError(
        `${PREFIX} "options[${index}].default" deve ser boolean.`,
      );
    }

    const builder = new StringSelectMenuOptionBuilder()
      .setLabel(label)
      .setValue(value);

    if (description !== undefined) {
      builder.setDescription(description);
    }

    if (option.emoji !== undefined && option.emoji !== null) {
      try {
        builder.setEmoji(option.emoji);
      } catch (error) {
        throw new TypeError(
          `${PREFIX} emoji inválido em options[${index}].`,
          { cause: error },
        );
      }
    }

    if (option.default !== undefined) {
      builder.setDefault(/** @type {boolean} */ (option.default));
    }

    validateBuilder(builder, `options[${index}]`);

    return builder;
  });

  const menu = new StringSelectMenuBuilder()
    .setCustomId(customId)
    .setMinValues(limits.minValues)
    .setMaxValues(limits.maxValues)
    .setDisabled(disabled)
    .addOptions(menuOptions);

  if (placeholder !== undefined) {
    menu.setPlaceholder(placeholder);
  }

  validateBuilder(menu, "StringSelectMenuBuilder");

  return menu;
}

/**
 * Cria um menu de seleção de usuários.
 * @param {object} options
 * @returns {UserSelectMenuBuilder}
 */
export function createUserSelectMenu(options) {
  const config = getEntityMenuOptions(options);

  const menu = new UserSelectMenuBuilder()
    .setCustomId(config.customId)
    .setMinValues(config.minValues)
    .setMaxValues(config.maxValues)
    .setDisabled(config.disabled)
    .setPlaceholder(config.placeholder ?? "Selecione usuários");

  validateBuilder(menu, "UserSelectMenuBuilder");

  return menu;
}

/**
 * Cria um menu de seleção de cargos.
 * @param {object} options
 * @returns {RoleSelectMenuBuilder}
 */
export function createRoleSelectMenu(options) {
  const config = getEntityMenuOptions(options);

  const menu = new RoleSelectMenuBuilder()
    .setCustomId(config.customId)
    .setMinValues(config.minValues)
    .setMaxValues(config.maxValues)
    .setDisabled(config.disabled)
    .setPlaceholder(config.placeholder ?? "Selecione cargos");

  validateBuilder(menu, "RoleSelectMenuBuilder");

  return menu;
}

/**
 * Cria um menu de seleção de canais.
 * @param {object} options
 * @param {ChannelType[]} [options.channelTypes]
 * @returns {ChannelSelectMenuBuilder}
 */
export function createChannelSelectMenu(options) {
  const opts = validateOptionsObject(options);
  const config = getEntityMenuOptions(opts);

  const menu = new ChannelSelectMenuBuilder()
    .setCustomId(config.customId)
    .setMinValues(config.minValues)
    .setMaxValues(config.maxValues)
    .setDisabled(config.disabled)
    .setPlaceholder(config.placeholder ?? "Selecione canais");

  if (opts.channelTypes !== undefined) {
    if (
      !Array.isArray(opts.channelTypes) ||
      opts.channelTypes.length === 0
    ) {
      throw new TypeError(
        `${PREFIX} "channelTypes" deve ser um array não vazio.`,
      );
    }

    const validChannelTypes = new Set(Object.values(ChannelType));

    for (const [index, type] of opts.channelTypes.entries()) {
      if (
        !Number.isInteger(type) ||
        !validChannelTypes.has(type)
      ) {
        throw new TypeError(
          `${PREFIX} channelTypes[${index}] não é um ChannelType válido.`,
        );
      }
    }

    if (new Set(opts.channelTypes).size !== opts.channelTypes.length) {
      throw new TypeError(
        `${PREFIX} "channelTypes" não pode conter valores duplicados.`,
      );
    }

    try {
      menu.setChannelTypes(
        .../** @type {ChannelType[]} */ (opts.channelTypes),
      );
    } catch (error) {
      throw new TypeError(
        `${PREFIX} não foi possível configurar channelTypes.`,
        { cause: error },
      );
    }
  }

  validateBuilder(menu, "ChannelSelectMenuBuilder");

  return menu;
}

/**
 * Cria um menu de seleção de usuários e cargos.
 * @param {object} options
 * @returns {MentionableSelectMenuBuilder}
 */
export function createMentionableSelectMenu(options) {
  const config = getEntityMenuOptions(options);

  const menu = new MentionableSelectMenuBuilder()
    .setCustomId(config.customId)
    .setMinValues(config.minValues)
    .setMaxValues(config.maxValues)
    .setDisabled(config.disabled)
    .setPlaceholder(
      config.placeholder ?? "Selecione usuários ou cargos",
    );

  validateBuilder(menu, "MentionableSelectMenuBuilder");

  return menu;
}

/**
 * Cria uma linha de ação para um menu de seleção.
 * @param {
 *   StringSelectMenuBuilder |
 *   UserSelectMenuBuilder |
 *   RoleSelectMenuBuilder |
 *   ChannelSelectMenuBuilder |
 *   MentionableSelectMenuBuilder
 * } menu
 * @returns {ActionRowBuilder}
 */
export function createSelectMenuRow(menu) {
  const valid =
    menu instanceof StringSelectMenuBuilder ||
    menu instanceof UserSelectMenuBuilder ||
    menu instanceof RoleSelectMenuBuilder ||
    menu instanceof ChannelSelectMenuBuilder ||
    menu instanceof MentionableSelectMenuBuilder;

  if (!valid) {
    throw new TypeError(
      `${PREFIX} createSelectMenuRow exige um builder de menu de seleção válido.`,
    );
  }

  validateBuilder(menu, "menu");

  const row = new ActionRowBuilder().addComponents(menu);

  validateBuilder(row, "ActionRowBuilder");

  return row;
}

/**
 * @typedef {
 *   (interaction: import("discord.js").AnySelectMenuInteraction) =>
 *     unknown | Promise<unknown>
 * } SelectMenuHandler
 */

/** @type {Map<string, SelectMenuHandler>} */
const selectMenuHandlers = new Map();

/**
 * Registra um handler de menu.
 * Não substitui registros existentes sem autorização explícita.
 *
 * @param {string} customId
 * @param {SelectMenuHandler} handler
 * @param {{replace?: boolean}} [options]
 */
export function registerSelectMenuHandler(
  customId,
  handler,
  options = {},
) {
  validateCustomId(customId);

  if (typeof handler !== "function") {
    throw new TypeError(`${PREFIX} handler deve ser uma função.`);
  }

  const opts = validateOptionsObject(options);

  if (
    opts.replace !== undefined &&
    typeof opts.replace !== "boolean"
  ) {
    throw new TypeError(`${PREFIX} replace deve ser boolean.`);
  }

  if (
    selectMenuHandlers.has(customId) &&
    opts.replace !== true
  ) {
    throw new Error(
      `${PREFIX} já existe um handler registrado para "${customId}". ` +
      "Use { replace: true } para substituí-lo intencionalmente.",
    );
  }

  selectMenuHandlers.set(customId, handler);
}

/**
 * Remove um handler registrado.
 * @param {string} customId
 * @returns {boolean}
 */
export function unregisterSelectMenuHandler(customId) {
  validateCustomId(customId);
  return selectMenuHandlers.delete(customId);
}

/**
 * Verifica se existe um handler registrado.
 * @param {string} customId
 * @returns {boolean}
 */
export function hasSelectMenuHandler(customId) {
  validateCustomId(customId);
  return selectMenuHandlers.has(customId);
}

/**
 * Processa uma interação de menu registrada.
 * @param {import("discord.js").Interaction} interaction
 * @returns {Promise<boolean>}
 */
export async function handleSelectMenu(interaction) {
  if (
    !interaction ||
    typeof interaction.isAnySelectMenu !== "function"
  ) {
    throw new TypeError(
      `${PREFIX} interaction não é uma interação Discord válida.`,
    );
  }

  if (!interaction.isAnySelectMenu()) {
    return false;
  }

  const handler = selectMenuHandlers.get(interaction.customId);

  if (!handler) {
    return false;
  }

  try {
    await handler(interaction);
  } catch (error) {
    throw new Error(
      `${PREFIX} o handler do menu "${interaction.customId}" falhou: ${
        error instanceof Error ? error.message : String(error)
      }`,
      { cause: error },
    );
  }

  return true;
}
