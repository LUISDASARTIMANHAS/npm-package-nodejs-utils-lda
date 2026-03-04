import { fopen, fwrite } from "../autoFileSysModule.mjs"
import { SlashCommandBuilder } from "@discordjs/builders";

let setStatusCommand = new SlashCommandBuilder()
	.setName("set-status")
	.setDescription("Usado para definir o status do bot. // Used to define the bot's status.")
	.addStringOption((option) =>
		option
			.setName("status")
			.setDescription("Qual o tipo do status?")
			.setRequired(true)
			.setChoices(
				{
					name: "Online",
					value: "online",
				},
				{
					name: "Do not disturb",
					value: "dnd",
				},
				{
					name: "idle",
					value: "idle",
				},
				{
					name: "invisible",
					value: "invisible",
				},
			),
	)
	.addStringOption((option) =>
		option
			.setName("description")
			.setDescription("Qual a descrição do status? // What is the status description?")
			.setRequired(true),
	);
setStatusCommand = setStatusCommand.toJSON();

function handleSetStatus(interaction) {
	if (interaction.commandName === "set-status") {
		const configs = fopen("./data/status.json");
		const options = interaction.options;
		const status = options.get("status").value;
		const descricao = options.get("description").value;
		configs.description = descricao;
		configs.typeStatus = status;

		fwrite("./data/status.json", configs);
		interaction.reply(
			`The status has been changed to: ${status} with default description: ${descricao}.
			O status foi alterado para: ${status} com descrição padrão: ${descricao}.`,
		);
		setTimeout(() => interaction.deleteReply(), 1000*20);
	}
}

export { setStatusCommand, handleSetStatus };
