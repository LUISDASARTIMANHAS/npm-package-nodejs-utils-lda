import { SlashCommandBuilder } from "discord.js";
import { discordHandleExecTemplate } from "../discordUtils.mjs";

let execCommand = new SlashCommandBuilder()
  .setName("exec")
  .setDescription(
    "Executes a command in the system (Windows CMD). // Executa um comando no sistema (CMD do Windows).",
  )
  .addStringOption((option) =>
    option
      .setName("command")
      .setDescription("Command to be executed. // Comando a ser executado.")
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName("args")
      .setDescription("args. extra args")
      .setRequired(false),
  );

execCommand = execCommand.toJSON();

/**
 * Lida com a execução do comando /exec
 * @param {import('discord.js').CommandInteraction} interaction
 */
async function handleExec(interaction) {
  if (interaction.commandName !== "exec") return;

  const comando = interaction.options.getString("command");
  const parameters = interaction.options.getString("parameters");
  await discordHandleExecTemplate(interaction, comando, parameters);
}

export { execCommand, handleExec };