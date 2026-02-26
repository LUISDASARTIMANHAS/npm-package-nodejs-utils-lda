const { fopen, fwrite } = require("../autoFileSysModule.cjs");
const { fetchPost } = require("../fetchUtils/fetchModule.cjs");
const { logError } = require("../logger/index.cjs");
const setEmbed = require("./discordEmbed.cjs");
function discordLogs(title, mensagem, footerText) {
  const configs = fopen("config.json").discordLogs;
  const date = new Date();
  const ano = date.getFullYear();
  const webhookUrl = process.env.DISCORD_LOGS_WEBHOOK_URL;
  const preSet = {
    content: "",
    embeds: [
      setEmbed(
        title,
        mensagem,
        configs.color,
        footerText || configs.footerText,
        configs.footerUrl,
      ),
    ],
    attachments: [],
  };
  let altWebhookUrl;

  if (webhookUrl == null || webhookUrl == "") {
    logError(
      `Not Found env file key DISCORD_LOGS_WEBHOOK_URL, Discord LOGS Disabled!`,
    );
    return null;
  } else {
    altWebhookUrl = webhookUrl;
  }
  fetchPost(altWebhookUrl, preSet, null, (error, data) => {
    if (error) {
      logError(error);
    }
  });
}

module.exports = discordLogs;