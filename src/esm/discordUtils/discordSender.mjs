import { fopen, fwrite } from "../autoFileSysModule.mjs";
import { fetchPost } from "../fetchUtils/fetchModule.mjs";
import { logError } from "../logger/index.mjs";
import setEmbed from "./discordEmbed.mjs";

export function discordLogs(title, mensagem, footerText) {
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