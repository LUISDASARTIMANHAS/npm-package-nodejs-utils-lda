/**
 * Estrutura do comando /exec
 */
export const execCommand = {
	name: "exec",
	description: "Executes a command in the system (Windows CMD). // Executa um comando no sistema (CMD do Windows).",
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

	try {
		await interaction.reply(`⏳ Executing command...
			⏳ Executando comando...`);
		const resultado = await execCmd(comando);
		await interaction.editReply({
			content: `🖥️ output/Saída:\n\`\`\`\n${resultado.slice(0, 1900)}\n\`\`\``,
		});
	} catch (err) {
	console.error(err);
	await interaction.editReply({
		content: `⚠️ Error while running/Erro ao executar:\n\`\`\`\n${(err.message || String(err)).slice(0, 1900)}\n\`\`\``,
	});
}

}
