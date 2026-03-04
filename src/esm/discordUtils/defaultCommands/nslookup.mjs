import { SlashCommandBuilder } from "@discordjs/builders";
import { discordHandleExecTemplate } from "../discordUtils.mjs";

let nslookupCommand = new SlashCommandBuilder()
  .setName("nslookup")
  .setDescription("name server lookup")
  .addStringOption((option) =>
    option
      .setName("domain")
      .setDescription("enter domain or ip to lookup")
      .setRequired(true),
  );

nslookupCommand = nslookupCommand.toJSON();

// help.js
async function handleNslookup(interaction) {
  if (interaction.commandName === "nslookup") {
    const domain = interaction.options.getString("domain");

    await discordHandleExecTemplate(interaction, `nslookup ${domain}`);
  }
}
export { nslookupCommand, handleNslookup };
