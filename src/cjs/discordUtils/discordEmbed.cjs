const { checkConfigValue, configExist, getConfig } = require("../configHelper.cjs");
configExist();

function setEmbed(title, description, colorHex, footerText, footerURL) {
  const date = new Date();
  const ano = date.getFullYear();
  const configs = getConfig().discordLogs;
  const embed = {
    title: title,
    description: description,
    color: parseInt(colorHex, 16) || configs.color,
    timestamp: date, // Adiciona um timestamp atual
    footer: {
      text: `₢All rights reserved - ${ano} - ${
        footerText || configs.footerText
      }`,
      icon_url: footerURL || configs.footerURL,
    },
  };
  return embed;
}
checkConfigValue("discordLogs.color","FF00FF")
checkConfigValue("discordLogs.footerText",null)
checkConfigValue("discordLogs.footerUrl","https://cdn.discordapp.com/attachments/952004420265205810/1188643212378787940/pingobras-logo-fundo.png?ex=6682a481&is=66815301&hm=cc9c387ac2aad7fa8040738f47ae0ab43e2b77027d188e272a147b1829e3a53f&")

module.exports = setEmbed;
