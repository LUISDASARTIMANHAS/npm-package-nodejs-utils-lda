// @ts-check
import {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  SectionBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags,
} from "discord.js";

import { checkConfigValue, configExist, getConfig } from "../configHelper.mjs";

configExist();

/**
 * Converte uma cor hexadecimal para inteiro.
 * @param {string|number|undefined} colorHex Cor hexadecimal.
 * @returns {number} Cor válida em formato inteiro.
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
 * Cria um container padrão da Pingobras.
 * @param {object} options Opções visuais.
 * @param {string} [options.title] Título.
 * @param {string} [options.description] Descrição.
 * @param {string|number} [options.colorHex] Cor hexadecimal.
 * @param {string} [options.footerText] Texto do rodapé.
 * @param {string} [options.footerURL] URL do logotipo.
 * @returns {ContainerBuilder} Container configurado.
 */
export function createContainer({
  title,
  description,
  colorHex,
  footerText,
  footerURL,
} = {}) {
  const configs = getConfig().discordLogs;
  const year = new Date().getFullYear();

  const container = new ContainerBuilder().setAccentColor(
    parseColor(colorHex ?? configs.color),
  );

  if (title) {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# ${title}`),
    );
  }

  if (description) {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(description),
    );
  }

  const footer = [
    `₢All rights reserved - ${year}`,
    footerText || configs.footerText,
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
 * @param {string} content Conteúdo do texto.
 * @returns {TextDisplayBuilder} Componente de texto.
 */
export function createText(content) {
  return new TextDisplayBuilder().setContent(content);
}

/**
 * Cria um divisor visual.
 * @param {boolean} [divider] Exibe linha divisória.
 * @returns {SeparatorBuilder} Divisor configurado.
 */
export function createSeparator(divider = true) {
  return new SeparatorBuilder()
    .setDivider(divider)
    .setSpacing(SeparatorSpacingSize.Small);
}

/**
 * Cria uma seção de texto com botão acessório.
 * @param {string|string[]} texts Textos da seção.
 * @param {import("discord.js").ButtonBuilder} button Botão acessório.
 * @returns {SectionBuilder} Seção configurada.
 */
export function createButtonSection(texts, button) {
  const items = Array.isArray(texts) ? texts : [texts];

  if (items.length < 1 || items.length > 3) {
    throw new RangeError("A seção deve conter de 1 a 3 componentes de texto.");
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
 * Cria uma galeria de imagens.
 * @param {string[]} urls URLs HTTPS das imagens.
 * @returns {MediaGalleryBuilder} Galeria configurada.
 */
export function createGallery(urls) {
  if (!Array.isArray(urls) || urls.length < 1 || urls.length > 10) {
    throw new RangeError("A galeria aceita de 1 a 10 imagens.");
  }

  const gallery = new MediaGalleryBuilder();

  gallery.addItems(
    ...urls.map((url) => {
      if (typeof url !== "string" || !url.startsWith("https://")) {
        throw new TypeError("As imagens devem usar URLs HTTPS.");
      }

      return new MediaGalleryItemBuilder().setURL(url);
    }),
  );

  return gallery;
}

/**
 * Prepara opções de mensagem Components V2.
 * @param {ContainerBuilder|import("discord.js").MessageTopLevelComponentBuilder[]} components Componentes.
 * @returns {object} Opções de resposta.
 */
export function createContainerMessage(components) {
  return {
    components: Array.isArray(components) ? components : [components],
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
