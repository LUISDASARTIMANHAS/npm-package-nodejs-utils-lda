## Functions

lista de funções disponiveis para discord na blibioteca npm-package-nodejs-utils-lda

```js
// general
function setEmbed(title, description, colorHex, footerText, footerURL);
function discordLogs(title, mensagem, footerText);

// utils
function getUsersCount(bot);
function getChannelsCount(bot);
function getGuildsCount(bot);
function getBotTag(bot);
function renderTemplate(template, variables);
function changeStatus(bot);
async function commandsSYNC(token,CLIENT_ID,restartSec);
async function validateInteractionChannel(interaction);
async function replyWarning(interaction, message, isPrivate = true);

// permissionValidators
function getBotPermissionsByInteraction(interaction);
function getPermissionName(permissionFlag);
async function verifyBotPermission(interaction, permissionFlag);
async function verifyManageMessagesInInteraction(interaction);
async function verifyBanInInteraction(interaction);


// moderation
/* -----------------------------
	MODERATION
----------------------------- */
async function executeModerationAction(interaction, targetUser, options);
async function banUser(interaction, targetUser, reason);
async function kickUser(interaction, targetUser, reason);
async function timeoutUser(interaction, targetUser, reason);

// implementsCommands
const defaultCommandHandlers = {
	ping: handlePing,
	setstatus: handleSetStatus,
	exec: handleExec,
	nslookup: handleNslookup,
	tracert: handleTracert,
	curl: handleCurl,
};
const defaultCommands = [
	pingCommand,
	setStatusCommand,
	execCommand,
	nslookupCommand,
	tracertCommand,
	curlCommand,
];

// interactionGetters
/* -----------------------------
	GUILD GETTERS
----------------------------- */
function getGuildByInteraction(interaction);
function getGuildIdByInteraction(interaction);
function getGuildNameByInteraction(interaction);
function getChannelFromInteraction(interaction);
function getChannelIdByInteraction(interaction);
function getChannelNameByInteraction(interaction);

/* -----------------------------
	 USER / MEMBER GETTERS
----------------------------- */
function getUserByInteraction(interaction);
function getUserIdByInteraction(interaction);
function getMemberByInteraction(interaction);
function getMemberRolesByInteraction(interaction);

/* -----------------------------
	 COMMAND GETTERS
----------------------------- */
function getCommandNameByInteraction(interaction);
function getSubcommandByInteraction(interaction);
function getOptionsByInteraction(interaction);

/* -----------------------------
	 METADATA GETTERS
----------------------------- */
function getInteractionType(interaction);
function getInteractionId(interaction);
function getInteractionToken(interaction);
function getCreatedTimestamp(interaction);
function isDM(interaction);

/* -----------------------------
	 SUMMARY GETTER
----------------------------- */
// Retorna um resumo completo da interação (útil para logs/debug).
// Returns a complete summary of the interaction (useful for logging/debugging).
function getInteractionSummary(interaction);

```
