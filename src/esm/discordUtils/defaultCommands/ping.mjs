import { SlashCommandBuilder } from "@discordjs/builders";
import { discordHandleExecTemplate } from "../discordUtils.mjs";

let pingCommand = new SlashCommandBuilder()
  .setName("ping")
  .setDescription(
    "ping network utility used to test the connectivity and measure the response time (latency).",
  ).addStringOption((option) =>
    option
      .setName("domain")
      .setDescription("enter domain or ip to curl")
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName("args")
      .setDescription("args. ping -4 google.com; ping -6 google.com")
      .setRequired(false),
  );

pingCommand = pingCommand.toJSON();

// ping
async function handlePing(interaction) {
  if (interaction.commandName === "ping") {
    const domain = interaction.options.getString("domain");
    const args = interaction.options.getString("args");

    await discordHandleExecTemplate(interaction, `ping ${domain}`,args);
  }
}

export { pingCommand, handlePing };
