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
import { handleSelectMenu } from "../helpers/selectMenuHelper.mjs";
import { handleModal } from "../helpers/modalHelper.mjs";
import { handleButton } from "../helpers/buttonHelper.mjs";

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
 * Clientes que já receberam a inicialização.
 * Evita registrar listeners duplicados.
 *
 * @type {WeakSet<import("discord.js").Client>}
 */
const initializedClients = new WeakSet();

/**
 * Trata erros de interações com componentes.
 *
 * @param {import("discord.js").Interaction} interaction Interação recebida.
 * @param {unknown} error Erro ocorrido.
 * @returns {Promise<void>}
 */
async function handleComponentError(interaction, error) {
	console.error("[discordUtils] Erro ao processar componente:", error);

	if (!interaction.isRepliable()) {
		return;
	}

	const response = {
		content: "Não foi possível processar esta interação.",
		ephemeral: true,
	};

	try {
		if (interaction.deferred || interaction.replied) {
			await interaction.followUp(response);
		} else {
			await interaction.reply(response);
		}
	} catch (replyError) {
		console.error(
			"[discordUtils] Não foi possível responder à interação:",
			replyError,
		);
	}
}

/**
 * Distribui interações de botões, menus e formulários
 * para os respectivos helpers.
 *
 * @param {import("discord.js").Interaction} interaction Interação recebida.
 * @returns {Promise<boolean>} Indica se algum helper processou a interação.
 */
export async function dispatchDefaultComponent(interaction) {
	try {
		if (interaction.isButton()) {
			return await handleButton(interaction);
		}

		if (interaction.isAnySelectMenu()) {
			return await handleSelectMenu(interaction);
		}

		if (interaction.isModalSubmit()) {
			return await handleModal(interaction);
		}

		return false;
	} catch (error) {
		await handleComponentError(interaction, error);
		return true;
	}
}

/**
 * Inicializa os recursos padrão para um cliente Discord.
 *
 * Registra os handlers de componentes apenas uma vez por cliente.
 * Os comandos slash continuam sendo despachados por
 * dispatchDefaultCommand() no router do cliente.
 *
 * @param {import("discord.js").Client} bot Cliente Discord.
 * @returns {void}
 */
export function initializeDefaultCommands(bot) {
	if (initializedClients.has(bot)) {
		return;
	}

	initializedClients.add(bot);

	initializeMonitor(bot);

	bot.on("interactionCreate", async (interaction) => {
		if (
			!interaction.isButton() &&
			!interaction.isAnySelectMenu() &&
			!interaction.isModalSubmit()
		) {
			return;
		}

		await dispatchDefaultComponent(interaction);
	});
}

/**
 * Despacha um comando padrão registrado.
 *
 * O comando /monitor não exige ManageMessages.
 * Os demais continuam sujeitos à validação de permissões.
 *
 * @param {import("discord.js").ChatInputCommandInteraction} interaction
 * Interação de comando slash.
 * @returns {Promise<boolean>} Indica se o comando foi processado.
 */
export async function dispatchDefaultCommand(interaction) {
	if (!interaction.isChatInputCommand()) {
		return false;
	}

	const handler = defaultCommandHandlers[interaction.commandName];

	if (!handler) {
		return false;
	}

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
