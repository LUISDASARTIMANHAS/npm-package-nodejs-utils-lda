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

/**
 * Valida o identificador de um menu.
 * @param {string} customId Identificador.
 * @returns {string} Identificador validado.
 */
function validateCustomId(customId) {
  if (
    typeof customId !== "string" ||
    customId.length < 1 ||
    customId.length > 100
  ) {
    throw new TypeError("customId deve conter entre 1 e 100 caracteres.");
  }

  return customId;
}

/**
 * Valida as opções de seleção múltipla.
 * @param {object} options Configurações.
 * @param {number} [options.minValues] Mínimo de seleções.
 * @param {number} [options.maxValues] Máximo de seleções.
 * @param {number} limit Limite máximo do tipo de menu.
 * @returns {{minValues: number, maxValues: number}} Limites validados.
 */
function validateSelectionLimits({ minValues = 1, maxValues = 1 }, limit) {
  if (
    !Number.isInteger(minValues) ||
    !Number.isInteger(maxValues) ||
    minValues < 0 ||
    maxValues < 1 ||
    minValues > maxValues ||
    maxValues > limit
  ) {
    throw new RangeError(
      `Seleção inválida: minValues deve ser menor ou igual a maxValues, entre 0 e ${limit}.`,
    );
  }

  return { minValues, maxValues };
}

/**
 * Configura um menu de seleção nativo do Discord.
 * @param {object} options Configurações comuns.
 * @param {string} options.customId Identificador.
 * @param {string} [options.placeholder] Texto de orientação.
 * @param {number} [options.minValues] Mínimo de escolhas.
 * @param {number} [options.maxValues] Máximo de escolhas.
 * @param {boolean} [options.disabled] Desabilita o menu.
 * @returns {{customId: string, placeholder?: string, minValues: number, maxValues: number, disabled: boolean}} Configurações validadas.
 */
function getEntityMenuOptions({
  customId,
  placeholder,
  minValues,
  maxValues,
  disabled = false,
}) {
  validateCustomId(customId);

  if (
    placeholder !== undefined &&
    (typeof placeholder !== "string" ||
      placeholder.length < 1 ||
      placeholder.length > 150)
  ) {
    throw new RangeError("placeholder deve conter entre 1 e 150 caracteres.");
  }

  return {
    customId,
    ...(placeholder !== undefined ? { placeholder } : {}),
    ...validateSelectionLimits({ minValues, maxValues }, 25),
    disabled,
  };
}

/**
 * Cria um menu com opções personalizadas.
 *
 * @param {object} options Configurações.
 * @param {string} options.customId Identificador.
 * @param {Array<{label: string, value: string, description?: string, emoji?: string, default?: boolean}>} options.options Opções disponíveis.
 * @param {string} [options.placeholder] Texto de orientação.
 * @param {number} [options.minValues] Mínimo de seleções.
 * @param {number} [options.maxValues] Máximo de seleções.
 * @param {boolean} [options.disabled] Desabilita o menu.
 * @returns {StringSelectMenuBuilder} Menu configurado.
 */
export function createStringSelectMenu({
  customId,
  options,
  placeholder,
  minValues = 1,
  maxValues = 1,
  disabled = false,
}) {
  validateCustomId(customId);

  if (!Array.isArray(options) || options.length < 1 || options.length > 25) {
    throw new RangeError("O menu deve possuir entre 1 e 25 opções.");
  }

  const limits = validateSelectionLimits(
    { minValues, maxValues },
    options.length,
  );

  const seenValues = new Set();

  const menuOptions = options.map((option) => {
    if (
      !option ||
      typeof option.label !== "string" ||
      option.label.length < 1 ||
      option.label.length > 100 ||
      typeof option.value !== "string" ||
      option.value.length < 1 ||
      option.value.length > 100
    ) {
      throw new TypeError(
        "Cada opção precisa de label e value entre 1 e 100 caracteres.",
      );
    }

    if (seenValues.has(option.value)) {
      throw new TypeError(`Valor de opção duplicado: ${option.value}`);
    }

    seenValues.add(option.value);

    if (
      option.description !== undefined &&
      (option.description.length < 1 || option.description.length > 100)
    ) {
      throw new RangeError("A descrição deve conter até 100 caracteres.");
    }

    const builder = new StringSelectMenuOptionBuilder()
      .setLabel(option.label)
      .setValue(option.value);

    if (option.description !== undefined) {
      builder.setDescription(option.description);
    }

    if (option.emoji !== undefined) {
      builder.setEmoji(option.emoji);
    }

    if (option.default !== undefined) {
      builder.setDefault(option.default);
    }

    return builder;
  });

  const menu = new StringSelectMenuBuilder()
    .setCustomId(customId)
    .setMinValues(limits.minValues)
    .setMaxValues(limits.maxValues)
    .setDisabled(disabled)
    .addOptions(menuOptions);

  if (placeholder !== undefined) {
    if (
      typeof placeholder !== "string" ||
      placeholder.length < 1 ||
      placeholder.length > 150
    ) {
      throw new RangeError("placeholder deve conter até 150 caracteres.");
    }

    menu.setPlaceholder(placeholder);
  }

  return menu;
}

/**
 * Cria um menu de seleção de usuários.
 * @param {object} options Configurações.
 * @returns {UserSelectMenuBuilder} Menu de usuários.
 */
export function createUserSelectMenu(options) {
  const config = getEntityMenuOptions(options);

  return new UserSelectMenuBuilder()
    .setCustomId(config.customId)
    .setMinValues(config.minValues)
    .setMaxValues(config.maxValues)
    .setDisabled(config.disabled)
    .setPlaceholder(config.placeholder ?? "Selecione usuários");
}

/**
 * Cria um menu de seleção de cargos.
 * @param {object} options Configurações.
 * @returns {RoleSelectMenuBuilder} Menu de cargos.
 */
export function createRoleSelectMenu(options) {
  const config = getEntityMenuOptions(options);

  return new RoleSelectMenuBuilder()
    .setCustomId(config.customId)
    .setMinValues(config.minValues)
    .setMaxValues(config.maxValues)
    .setDisabled(config.disabled)
    .setPlaceholder(config.placeholder ?? "Selecione cargos");
}

/**
 * Cria um menu de seleção de canais.
 * @param {object} options Configurações.
 * @param {ChannelType[]} [options.channelTypes] Tipos permitidos.
 * @returns {ChannelSelectMenuBuilder} Menu de canais.
 */
export function createChannelSelectMenu({ channelTypes, ...options }) {
  const config = getEntityMenuOptions(options);

  const menu = new ChannelSelectMenuBuilder()
    .setCustomId(config.customId)
    .setMinValues(config.minValues)
    .setMaxValues(config.maxValues)
    .setDisabled(config.disabled)
    .setPlaceholder(config.placeholder ?? "Selecione canais");

  if (channelTypes !== undefined) {
    if (!Array.isArray(channelTypes) || channelTypes.length === 0) {
      throw new TypeError("channelTypes deve ser um array não vazio.");
    }

    menu.setChannelTypes(...channelTypes);
  }

  return menu;
}

/**
 * Cria um menu de seleção de usuários ou cargos.
 * @param {object} options Configurações.
 * @returns {MentionableSelectMenuBuilder} Menu de menções.
 */
export function createMentionableSelectMenu(options) {
  const config = getEntityMenuOptions(options);

  return new MentionableSelectMenuBuilder()
    .setCustomId(config.customId)
    .setMinValues(config.minValues)
    .setMaxValues(config.maxValues)
    .setDisabled(config.disabled)
    .setPlaceholder(config.placeholder ?? "Selecione usuários ou cargos");
}

/**
 * Cria uma linha de ação para um menu de seleção.
 * Cada linha comporta apenas um menu de seleção.
 *
 * @param {
 *   StringSelectMenuBuilder |
 *   UserSelectMenuBuilder |
 *   RoleSelectMenuBuilder |
 *   ChannelSelectMenuBuilder |
 *   MentionableSelectMenuBuilder
 * } menu Menu a ser adicionado.
 * @returns {ActionRowBuilder} Linha de ação.
 */
export function createSelectMenuRow(menu) {
  return new ActionRowBuilder().addComponents(menu);
}

/** @type {Map<string, (interaction: import("discord.js").AnySelectMenuInteraction) => Promise<void>>} */
const selectMenuHandlers = new Map();

/**
 * Registra um handler para um menu de seleção.
 * @param {string} customId Identificador do menu.
 * @param {(interaction: import("discord.js").AnySelectMenuInteraction) => Promise<void>} handler Função executada após a seleção.
 * @returns {void}
 */
export function registerSelectMenuHandler(customId, handler) {
  validateCustomId(customId);

  if (typeof handler !== "function") {
    throw new TypeError("handler deve ser uma função.");
  }

  selectMenuHandlers.set(customId, handler);
}

/**
 * Processa uma interação de menu registrada.
 * @param {import("discord.js").Interaction} interaction Interação recebida.
 * @returns {Promise<boolean>} Indica se a interação foi processada.
 */
export async function handleSelectMenu(interaction) {
  if (!interaction.isAnySelectMenu()) return false;

  const handler = selectMenuHandlers.get(interaction.customId);

  if (!handler) return false;

  await handler(interaction);
  return true;
}
