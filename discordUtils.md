# Functions

Lista de funções disponíveis na biblioteca npm `npm-package-nodejs-utils-lda`.

## 1. Discord — Containers e mensagens

**`containerHelper.mjs`**

Funções para criar mensagens usando Discord Components V2.

```js
// Converte uma cor hexadecimal para o formato utilizado pelo Discord.
function parseColor(colorHex);

// Cria um container.
function createContainer(options);

// Cria um componente de texto.
function createText(content);

// Cria um separador visual.
function createSeparator(divider = true);

// Cria uma seção com texto e um botão.
function createButtonSection(texts, button);

// Cria uma galeria de imagens.
function createGallery(urls);

// Prepara os componentes para enviar uma mensagem com container.
function createContainerMessage(components);
```

> Containers são estruturas visuais. O tratamento de interações fica nos helpers dos componentes interativos.

## 2. Discord — Embeds legados e logs

**`embedHelper.mjs`**

```js
// Compatibilidade com mensagens no formato Embed.
function setEmbed(title, description, colorHex, footerText, footerURL);

// Registra ou envia logs do Discord.
function discordLogs(title, mensagem, footerText);
```

> `setEmbed` permanece documentado como helper legado. Para novas mensagens com Components V2, utilize `containerHelper.mjs` quando apropriado.

## 3. Discord — Botões

**`buttonHelper.mjs`**

Funções para criar botões e registrar seus handlers.

```js
// Registra um handler para um customId.
function registerButtonHandler(customId, handler);

// Remove um handler registrado.
function unregisterButtonHandler(customId);

// Verifica se existe um handler para o customId.
function hasButtonHandler(customId);

// Processa uma interação de botão registrada.
async function handleButton(interaction);

// Cria um botão interativo.
function createButton(options);

// Cria um botão de link.
function createLinkButton(url, label, emoji);

// Cria uma Action Row para botões.
function createButtonRow(buttons);

// Cria um botão desabilitado.
function createDisabledButton(customId, label);

// Enum de estilos de botão do Discord.
const ButtonStyle;
```

Os botões interativos podem ter handlers associados ao `customId`. Botões de link abrem uma URL e não geram uma interação de clique para o bot.

## 4. Discord — Menus de seleção

**`selectMenuHelper.mjs`**

```js
// Cria um menu de seleção de opções de texto.
function createStringSelectMenu(options);

// Cria um menu de seleção de usuários.
function createUserSelectMenu(options);

// Cria um menu de seleção de cargos.
function createRoleSelectMenu(options);

// Cria um menu de seleção de canais.
function createChannelSelectMenu(options);

// Cria um menu de seleção de usuários, cargos e outros alvos compatíveis.
function createMentionableSelectMenu(options);

// Cria uma Action Row para um menu.
function createSelectMenuRow(menu);

// Registra um handler para um customId.
function registerSelectMenuHandler(customId, handler);

// Processa uma interação de menu de seleção registrada.
async function handleSelectMenu(interaction);
```

## 5. Discord — Modais

**`modalHelper.mjs`**

```js
// Cria um campo de texto para um modal.
function createTextInput(options);

// Cria um modal.
function createModal(options);

// Obtém o valor de um campo do modal.
function getModalValue(interaction, customId, trim = true);

// Obtém os valores de vários campos.
function getModalValues(interaction, fieldIds);

// Registra um handler para o envio de um modal.
function registerModalHandler(customId, handler);

// Processa o envio de um modal registrado.
async function handleModal(interaction);

// Enum dos estilos dos campos de texto.
const TextInputStyle;
```

## 6. Discord — Execução de comandos pelo shell

```js
async function discordHandleExecTemplate(
  interaction,
  execCommand,
  parameters = ""
);
```

Executa o fluxo de comando pelo Discord usando o template disponibilizado pela biblioteca.

## 7. Utilitários gerais do bot

```js
function getUsersCount(bot);
function getChannelsCount(bot);
function getGuildsCount(bot);
function getBotTag(bot);
function renderTemplate(template, variables);
function changeStatus(bot);

async function commandsSYNC(token, CLIENT_ID, restartSec);

async function validateInteractionChannel(interaction);
async function discordAwaitReply(interaction);
async function replyWarning(interaction, message, isPrivate = true);
```

## 8. Validadores de permissões

**`permissionValidators.mjs`**

```js
function getBotPermissionsByInteraction(interaction);
function getPermissionName(permissionFlag);

async function verifyBotPermission(interaction, permissionFlag);
async function verifyManageMessagesInInteraction(interaction);
async function verifyBanInInteraction(interaction);
```

## 9. Moderação

```js
async function executeModerationAction(interaction, targetUser, options);

async function banUser(interaction, targetUser, reason);
async function kickUser(interaction, targetUser, reason);
async function timeoutUser(interaction, targetUser, reason);
```

## 10. Comandos padrão

**`implementsCommands.mjs`**

### Handlers de comandos

```js
const defaultCommandHandlers = {
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
```

### Comandos disponíveis

```js
const defaultCommands = [
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
```

### Inicialização e despacho

```js
// Inicializa os recursos dos comandos padrão.
function initializeDefaultCommands(bot);

// Encaminha comandos de barra para seus handlers.
async function dispatchDefaultCommand(interaction);

// Encaminha interações de botões, menus e modais.
async function dispatchDefaultComponent(interaction);
```

O despacho de componentes encaminha cada interação ao helper correspondente. Os handlers devem ser registrados com os respectivos helpers antes de serem utilizados.

## 11. Interaction Getters

### Guild e canais

```js
function getGuildByInteraction(interaction);
function getGuildIdByInteraction(interaction);
function getGuildNameByInteraction(interaction);

function getChannelFromInteraction(interaction);
function getChannelIdByInteraction(interaction);
function getChannelNameByInteraction(interaction);
```

### Usuários e membros

```js
function getUserByInteraction(interaction);
function getUserIdByInteraction(interaction);

function getMemberByInteraction(interaction);
function getMemberRolesByInteraction(interaction);
```

### Comandos e opções

```js
function getCommandNameByInteraction(interaction);
function getSubcommandByInteraction(interaction);
function getOptionsByInteraction(interaction);
```

### Metadados da interação

```js
function getInteractionType(interaction);
function getInteractionId(interaction);
function getInteractionToken(interaction);
function getCreatedTimestamp(interaction);
function isDM(interaction);
```

### Resumo da interação

```js
// Retorna um resumo completo da interação, útil para logs e depuração.
function getInteractionSummary(interaction);
```

## 12. Sistema de tickets

### Construção e interpretação de custom IDs

```js
function buildTicketCloseCustomId(ticketType, logChannelId);

function buildTicketCreateCustomId(
  ticketType,
  categoryId,
  staffRoleId,
  logChannelId
);

function getTicketCustomIdParts(customId);

function parseTicketCloseCustomId(customId);
function parseTicketCreateCustomId(customId);
```

### Operações de tickets

```js
async function closeTicket(interaction);

async function createTicketChannelFromInteraction(
  interaction,
  options
);

function formatTicketChannelTopic(ticketType, userTag);

function getStaffDiscussionThreadName();

function hasOpenTicket(userId);

function registerTicket(userId, channelId);

function removeTicketByChannel(channelId);
```