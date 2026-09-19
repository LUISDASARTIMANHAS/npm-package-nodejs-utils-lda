import { SlashCommandBuilder } from "@discordjs/builders";
import { discordHandleExecTemplate } from "../discordUtils.mjs";


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
		const quotedPrompt = JSON.stringify(prompt ?? "");

		await discordHandleExecTemplate(interaction, "agy -p", quotedPrompt);
	}
}

export { agyCommand, handleAgy };
