// src\esm\discordUtils\defaultCommands\implementsCommands.mjs

import { verifyManageMessagesInInteraction } from "../permissionValidators.mjs";

import { curlCommand, handleCurl } from "./curl.mjs";
import { execCommand, handleExec } from "./exec.mjs";
import { handleNslookup, nslookupCommand } from "./nslookup.mjs";
import { handlePing, pingCommand } from "./ping.mjs";
import { handleSetStatus, setStatusCommand } from "./setStatus.mjs";
import { handleTracert, tracertCommand } from "./tracert.mjs";
import { statusCommand, handleStatus } from "./status.mjs";
import { nmapCommand, handleNmap } from "./nmap.mjs";
import { agyCommand, handleAgy } from "./agy.mjs";

import {
	monitorCommand,
	handleMonitor,
	initializeMonitor,
} from "./monitor.mjs";

// Handlers dos comandos padrão.
export const defaultCommandHandlers = {
	ping: handlePing,
	setstatus: handleSetStatus,
	exec: handleExec,
	nslookup: handleNslookup,
	tracert: handleTracert,
	curl: handleCurl,
	status: handleStatus,
	monitor: handleMonitor,
	nmap: handleNmap,
	agy: handleAgy,
};

// Definições dos comandos slash.
export const defaultCommands = [
	pingCommand,
	setStatusCommand,
	execCommand,
	nslookupCommand,
	tracertCommand,
	curlCommand,
	statusCommand,
	monitorCommand,
	nmapCommand,
	agyCommand,
];

/**
 * Inicializa os recursos dos comandos padrão para um cliente.
 *
 * Deve ser chamado uma vez para cada Client do Discord.
 *
 * @param {import("discord.js").Client} bot
 */
export function initializeDefaultCommands(bot) {
	initializeMonitor(bot);
}

/**
 * Despacha um comando padrão registrado.
 *
 * O comando /monitor é público; os demais continuam sujeitos
 * à validação de permissões que deve ser feita pelo router do cliente.
 *
 * @param {import("discord.js").ChatInputCommandInteraction} interaction
 * @returns {Promise<boolean>}
 */
export async function dispatchDefaultCommand(interaction) {
	if (!interaction.isChatInputCommand()) {
		return false;
	}

	const handler = defaultCommandHandlers[interaction.commandName];

	if (!handler) {
		return false;
	}

	// O monitor não exige ManageMessages.
	if (interaction.commandName !== "monitor") {
		if (await verifyManageMessagesInInteraction(interaction)) {
			return true;
		}
	}

	await handler(interaction);
	return true;
}

// exemplo de codigo que o cliente usa

// initializeDefaultCommands(bot);

// bot.on("interactionCreate", async (interaction) => {
//   try {
//     // O erro "O aplicativo não respondeu" no Discord ocorre porque o bot tem um prazo de 3 segundos para responder a uma interação de comando de barra (slash command). Se o código demorar mais do que isso ou travar, o Discord cancela a interação
//     // Solução: Use a função de adiamento da resposta logo no início do comando para avisar o Discord que o bot está processando:
//     await interaction.deferReply();
//     if (interaction.isButton()) {
//       await handleTicketButtons(interaction);
//       return;
//     }

//     if (!interaction.isChatInputCommand()) return;

//     // const interactionSummary = getInteractionSummary(interaction);
//     // console.log(interactionSummary);

//     if (await validateInteractionChannel(interaction)) return;
//     if (await verifyManageMessagesInInteraction(interaction)) return;

//     const handler = commandHandlers[interaction.commandName];

//     if (handler) {
//       await handler(interaction);
//     }
//   } catch (error) {
//     console.error(error);

//     if (!interaction.replied && !interaction.deferred) {
//       await replyWarning(
//         interaction,
//         `ERR: 500 - INTERNAL SERVER ERROR. REASON: ${error}`,
//         false,
//       );
//     }
//   }
// });
