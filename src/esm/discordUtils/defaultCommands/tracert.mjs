import { SlashCommandBuilder } from "@discordjs/builders";
import { discordHandleExecTemplate } from "../discordUtils.mjs";

let tracertCommand = new SlashCommandBuilder()
  .setName("tracert")
  .setDescription(
    "tool for recording the response delays and routing loops in a network pathway",
  )
  .addStringOption((option) =>
    option
      .setName("domain")
      .setDescription("enter domain or ip to traceroute")
      .setRequired(true),
  );

tracertCommand = tracertCommand.toJSON();

// help.js
async function handleTracert(interaction) {
  if (interaction.commandName === "tracert") {
    const domain = interaction.options.getString("domain");

    await discordHandleExecTemplate(interaction, `tracert ${domain}`);
  }
}

export { tracertCommand, handleTracert };
