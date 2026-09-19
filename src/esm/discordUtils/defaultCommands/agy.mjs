import { SlashCommandBuilder } from "@discordjs/builders";
import { discordHandleExecTemplate } from "npm-package-nodejs-utils-lda";

let agyCommand = new SlashCommandBuilder()
	.setName("agy")
	.setDescription(
		"Google's Antigravity CLI.",
	)
	.addStringOption((option) =>
		option
			.setName("prompt")
			.setDescription("prompt")
			.setRequired(false),
	);

agyCommand = agyCommand.toJSON();

// agy
async function handleAgy(interaction) {
	if (interaction.commandName === "agy") {
		const prompt = interaction.options.getString("prompt");

		discordHandleExecTemplate(interaction, "agy", prompt);
	}
}

export { agyCommand, handleAgy };
