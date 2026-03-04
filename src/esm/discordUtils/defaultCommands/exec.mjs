import { discordHandleExecTemplate } from "../discordUtils.mjs";

/**
 * Estrutura do comando /exec
 */
export const execCommand = {
  name: "exec",
  description:
    "Executes a command in the system (Windows CMD). // Executa um comando no sistema (CMD do Windows).",
  options: [
    {
      name: "command",
      description: "Command to be executed. // Comando a ser executado.",
      type: 3,
      required: true,
    },
  ],
};

/**
 * Lida com a execução do comando /exec
 * @param {import('discord.js').CommandInteraction} interaction
 */
export async function handleExec(interaction) {
  if (interaction.commandName !== "exec") return;

  const comando = interaction.options.getString("command");
	await discordHandleExecTemplate(comando)
}


