import { verifyManageMessagesInInteraction } from "../permissionValidators.mjs";
import { curlCommand, handleCurl } from "./curl.mjs";
import { execCommand, handleExec } from "./exec.mjs";
import { handleNslookup, nslookupCommand } from "./nslookup.mjs";
import { handlePing, pingCommand } from "./ping.mjs";
import { handleSetStatus, setStatusCommand } from "./setStatus.mjs";
import { handleTracert, tracertCommand } from "./tracert.mjs";

export const defaultCommandHandlers = {
	ping: handlePing,
	setstatus: handleSetStatus,
	exec: handleExec,
	nslookup: handleNslookup,
	tracert: handleTracert,
	curl: handleCurl,
};
export const defaultCommands = [
	pingCommand,
	setStatusCommand,
	execCommand,
	nslookupCommand,
	tracertCommand,
	curlCommand,
];


// bot.on("interactionCreate", async (interaction) => {
//   try {
//     if (!interaction.isChatInputCommand()) return;

//     const interactionSummary = getInteractionSummary(interaction);
//     console.log(interactionSummary);

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
