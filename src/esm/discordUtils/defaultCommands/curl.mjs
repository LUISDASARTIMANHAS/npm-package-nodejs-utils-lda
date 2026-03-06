import { SlashCommandBuilder } from "@discordjs/builders";
import { discordHandleExecTemplate } from "../discordUtils.mjs";

let curlCommand = new SlashCommandBuilder()
  .setName("curl")
  .setDescription(
    "curl is used in command lines or scripts to transfer data. curl is also libcurl",
  )
  .addStringOption((option) =>
    option
      .setName("domain")
      .setDescription("enter domain or ip to curl")
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName("args")
      .setDescription("extra args")
      .setRequired(true),
  );

curlCommand = curlCommand.toJSON();

// help.js
async function handleCurl(interaction) {
  if (interaction.commandName === "curl") {
    const domain = interaction.options.getString("domain");
    const args = interaction.options.getString("args");

    await discordHandleExecTemplate(interaction, `curl ${args} ${domain}`);
  }
}

export { curlCommand, handleCurl };
