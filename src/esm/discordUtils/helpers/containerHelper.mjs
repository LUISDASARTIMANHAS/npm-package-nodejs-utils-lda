// @ts-check
import {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  SectionBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  MessageFlags,
} from "discord.js";

import {
  checkConfigValue,
  configExist,
  getConfig,
} from "../../configHelper.mjs";

configExist();

const COMPONENTS_PREFIX = "[LDA COMPONENTS]";

/**
 * Valida um texto obrigatório.
 * @param {unknown} value
 * @param {string} name
 * @returns {string}
 */
function requireText(value, name) {
  if (typeof value !== "string") {
    throw new TypeError(`${COMPONENTS_PREFIX} "${name}" deve ser uma string.`);
  }

  if (value.trim().length === 0) {
    throw new TypeError(`${COMPONENTS_PREFIX} "${name}" não pode estar vazio.`);
  }

  return value;
}

/**
 * Valida um texto opcional.
 * @param {unknown} value
 * @param {string} name
 * @returns {string|undefined}
 */
function optionalText(value, name) {
  if (value === undefined || value === null) {
    return undefined;
  }

  return requireText(value, name);
}

/**
 * Valida uma URL HTTPS.
 * @param {unknown} value
 * @param {string} name
 * @returns {string}
 */
function requireHttpsUrl(value, name) {
  requireText(value, name);

  let url;

  try {
    url = new URL(value);
  } catch {
    throw new TypeError(
      `${COMPONENTS_PREFIX} "${name}" deve ser uma URL válida.`,
    );
  }

  if (url.protocol !== "https:") {
    throw new TypeError(`${COMPONENTS_PREFIX} "${name}" deve utilizar HTTPS.`);
  }

  return url.href;
}

/**
 * Converte uma cor hexadecimal para inteiro.
 * Valores inválidos utilizam a cor padrão magenta.
 * @param {string|number|undefined} colorHex
 * @returns {number}
 */
export function parseColor(colorHex) {
  if (typeof colorHex === "number") {
    return Number.isInteger(colorHex) && colorHex >= 0 && colorHex <= 0xffffff
      ? colorHex
      : 0xff00ff;
  }

  if (typeof colorHex === "string") {
    const normalized = colorHex.replace(/^#/, "");

    if (/^[0-9a-fA-F]{6}$/.test(normalized)) {
      return Number.parseInt(normalized, 16);
    }
  }

  return 0xff00ff;
}

/**
 * Cria um container padrão.
 * @param {object} [options]
 * @param {string} [options.title]
 * @param {string} [options.description]
 * @param {string|number} [options.colorHex]
 * @param {string} [options.footerText]
 * @param {string} [options.footerURL] Opção legada; não é renderizada no rodapé.
 * @returns {ContainerBuilder}
 */
export function createContainer(options = {}) {
  if (
    options === null ||
    typeof options !== "object" ||
    Array.isArray(options)
  ) {
    throw new TypeError(
      `${COMPONENTS_PREFIX} createContainer espera um objeto de opções.`,
    );
  }

  const { title, description, colorHex, footerText, footerURL } = options;

  const validTitle = optionalText(title, "title");
  const validDescription = optionalText(description, "description");
  const validFooterText = optionalText(footerText, "footerText");

  // Compatibilidade com chamadas antigas: valida, mas não renderiza.
  if (footerURL !== undefined && footerURL !== null) {
    requireHttpsUrl(footerURL, "footerURL");
  }

  if (
    colorHex !== undefined &&
    colorHex !== null &&
    typeof colorHex !== "string" &&
    typeof colorHex !== "number"
  ) {
    throw new TypeError(
      `${COMPONENTS_PREFIX} "colorHex" deve ser uma string ou um número.`,
    );
  }

  const config = getConfig();
  const configs = config?.discordLogs ?? {};
  const year = new Date().getFullYear();

  const container = new ContainerBuilder().setAccentColor(
    parseColor(colorHex ?? configs.color),
  );

  if (validTitle !== undefined) {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# ${validTitle}`),
    );
  }

  if (validDescription !== undefined) {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(validDescription),
    );
  }

  const footer = [
    `₢All rights reserved - ${year}`,
    validFooterText ??
      optionalText(configs.footerText ?? undefined, "discordLogs.footerText"),
  ]
    .filter(Boolean)
    .join(" - ");

  if (footer) {
    container.addSeparatorComponents(
      new SeparatorBuilder()
        .setDivider(true)
        .setSpacing(SeparatorSpacingSize.Small),
    );

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`-# ${footer}`),
    );
  }

  return container;
}

/**
 * Cria um componente de texto Markdown.
 * @param {string} content
 * @returns {TextDisplayBuilder}
 */
export function createText(content) {
  return new TextDisplayBuilder().setContent(requireText(content, "content"));
}

/**
 * Cria um divisor visual.
 * @param {boolean} [divider=true]
 * @returns {SeparatorBuilder}
 */
export function createSeparator(divider = true) {
  if (typeof divider !== "boolean") {
    throw new TypeError("divider deve ser boolean.");
  }

  return new SeparatorBuilder()
    .setDivider(divider)
    .setSpacing(SeparatorSpacingSize.Small);
}

/**
 * Cria uma seção de texto com botão acessório.
 * @param {string|string[]} texts
 * @param {ButtonBuilder} button
 * @returns {SectionBuilder}
 */
export function createButtonSection(texts, button) {
  const items = Array.isArray(texts) ? texts : [texts];

  if (items.length < 1 || items.length > 3) {
    throw new RangeError(
      `${COMPONENTS_PREFIX} uma seção deve conter de 1 a 3 textos.`,
    );
  }

  items.forEach((content, index) => {
    requireText(content, `texts[${index}]`);
  });

  if (!(button instanceof ButtonBuilder)) {
    throw new TypeError(
      `${COMPONENTS_PREFIX} "button" deve ser um ButtonBuilder válido.`,
    );
  }

  const section = new SectionBuilder();

  for (const content of items) {
    section.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(content),
    );
  }

  return section.setButtonAccessory(button);
}

/**
 * Cria uma galeria de imagens HTTPS.
 * @param {string[]} urls
 * @returns {MediaGalleryBuilder}
 */
export function createGallery(urls) {
  if (!Array.isArray(urls)) {
    throw new TypeError(`${COMPONENTS_PREFIX} "urls" deve ser um array.`);
  }

  if (urls.length < 1 || urls.length > 10) {
    throw new RangeError(
      `${COMPONENTS_PREFIX} a galeria aceita de 1 a 10 imagens.`,
    );
  }

  const gallery = new MediaGalleryBuilder();

  gallery.addItems(
    ...urls.map((url, index) => {
      const validUrl = requireHttpsUrl(url, `urls[${index}]`);
      return new MediaGalleryItemBuilder().setURL(validUrl);
    }),
  );

  return gallery;
}

/**
 * Valida um componente antes de adicioná-lo à mensagem.
 * @param {unknown} component
 * @param {number} index
 */
function validateComponent(component, index) {
  if (component instanceof ContainerBuilder) {
    console.log("[LDA DEBUG] Container interno:", component.components);

    component.components.forEach((child, childIndex) => {
      if (child instanceof TextDisplayBuilder) {
        try {
          child.toJSON();
        } catch (error) {
          console.error(
            `[LDA DEBUG] TextDisplay inválido no índice ${childIndex}:`,
            child,
          );
          throw error;
        }
      }
    });
  }

  const supportedBuilders = [
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SectionBuilder,
    MediaGalleryBuilder,
    ActionRowBuilder,
  ];

  if (!supportedBuilders.some((Builder) => component instanceof Builder)) {
    throw new TypeError(
      `${COMPONENTS_PREFIX} componente inválido na posição ${index}.`,
    );
  }

  try {
    const json = component.toJSON();

    if (!json || typeof json !== "object" || !Number.isInteger(json.type)) {
      throw new TypeError("O componente não produziu um JSON válido.");
    }
  } catch (error) {
    throw new TypeError(
      `${COMPONENTS_PREFIX} o componente na posição ${index} é inválido: ${
        error instanceof Error ? error.message : String(error)
      }`,
      { cause: error },
    );
  }
}

/**
 * Prepara opções para uma mensagem Components V2.
 * @param {ContainerBuilder|import("discord.js").MessageTopLevelComponentBuilder[]} components
 * @returns {object}
 */
export function createContainerMessage(components) {
  const items = Array.isArray(components) ? components : [components];

  if (items.length < 1) {
    throw new RangeError(
      `${COMPONENTS_PREFIX} a mensagem precisa de pelo menos um componente.`,
    );
  }

  items.forEach(validateComponent);

  return {
    components: items,
    flags: MessageFlags.IsComponentsV2,
    allowedMentions: {
      parse: [],
    },
  };
}

checkConfigValue("discordLogs.color", "FF00FF");
checkConfigValue("discordLogs.footerText", null);
checkConfigValue(
  "discordLogs.footerURL",
  "https://cdn.discordapp.com/attachments/952004420265205810/1188643212378787940/pingobras-logo-fundo.png",
);
