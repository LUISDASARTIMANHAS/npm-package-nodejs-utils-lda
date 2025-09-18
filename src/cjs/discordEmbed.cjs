const { fopen, fwrite } = require("./autoFileSysModule.cjs");
const { configExist } = require("./configHelper.cjs");

configExist();

function setEmbed(title, description, colorHex, footerText, footerURL) {
  checkConfigIntegrity();
  const date = new Date();
  const ano = date.getFullYear();
	const configs = fopen("config.json").discordLogs;
  const embed = {
    title: title,
    description: description,
    color: parseInt(colorHex, 16) || configs.color,
    timestamp: date, // Adiciona um timestamp atual
    footer: {
      text: `₢All rights reserved - ${ano} - ${footerText || configs.footerText}`,
      icon_url: footerURL || configs.footerURL,
    },
  };
  return embed;
}

function checkConfigIntegrity() {
  // obtem config.json
  const configs = fopen("config.json");
  // Verificar se a chave emailSystem existe antes de acessá-la
  if (!configs.discordLogs) {
    // Cria discordLogs caso não exista
    configs.discordLogs = {};
  }
  const discordLogsConfig = configs.discordLogs;

  // Verificar e atribuir valores padrão, se necessário
  if (
    !discordLogsConfig.color ||
    !discordLogsConfig.footerText ||
    !discordLogsConfig.footerUrl
  ) {
    configs.discordLogs.color = configs.discordLogs.color || "FF00FF";
    configs.discordLogs.footerText = configs.discordLogs.footerText || null;
    configs.discordLogs.footerUrl =
      configs.discordLogs.footerUrl ||
      "https://cdn.discordapp.com/attachments/952004420265205810/1188643212378787940/pingobras-logo-fundo.png?ex=6682a481&is=66815301&hm=cc9c387ac2aad7fa8040738f47ae0ab43e2b77027d188e272a147b1829e3a53f&";
    // salva novamente
    fwrite("config.json", configs);
  }
}

module.exports = setEmbed;
