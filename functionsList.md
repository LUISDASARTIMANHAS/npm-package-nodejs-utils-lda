
## Functions

lista de funções disponiveis na blibioteca npm-package-nodejs-utils-lda

```js
// FS SYSTEM
function fopen(filePath);
function fwrite(filePath, data);
function fwriteBin(filePath, data);
function stringToBinary(str, binaryLenght);
function freadBin(filePath);
function binaryToString(binary, binaryLenght);

// CONFIG
function configExist();
function getConfig();
function saveConfig(data);
function checkConfigValue(key, value);

function checkHeaderMiddleware(app);
function sendMail(email, subject, text, function(error,data));
function fetchGet(url, header, callback);
function fetchDownloadStream(url, callback);
function fetchPost(url, payload, header, function(error,data));
// only JSON
function fetchPostJson(url, payload, header, callback);
function httpsSecurityMiddleware(req, res, next);
function setCacheHeaders(req, res, next);
function getRandomInt(max);
function getRandomBin(max);
function getRandomHex(max);
function generateToken();
function validadeApiKey(req,res,key);
function forbidden(res);
function unauthorized(res);
function notfound(res);
function discordLogs(title, message)
async function discordAwaitReply(interaction);
function autoLoader(app);
function spaceUsed(space, used);
function serverTry(res,callback)
function sendFileToDiscord(file, webhookUrl);
function log(message, filepath = "logs.txt", maxLength = 100);
async function shell(cmd, args = []);
function sanitizeNetworkInterfaces(interfaces);

// OTP AUTH AND MAIL
async function requestAuthCode(email, ttlMin = 5);
function getOTP(email);
function deleteOTP(email);
function saveOTP(email, hash, expiresAt);
async function verifyAuthCode(email, code);

// dashboard
function StatusDashboard(app);

// expose folders
function exposeFolders(app, folderPath, route);
function exposePublicFolder(app);
function exposeLogsFolder(app);
function fileExistAndCreate(filePath,defaultContent = []);

// MONGO DB
async function connectMongo(connectionString);
async function closeMongo();
async function findDocuments(databaseName, collectionName, query, options);
async function findOneDocument(databaseName, collectionName, query, options);
async function existsDocument(databaseName, collectionName, query);
async function countDocuments(databaseName, collectionName, query);
async function insertDocument(databaseName, collectionName, data);
async function insertManyDocuments(databaseName, collectionName, data);
async function updateOneDocument(databaseName, collectionName, filter, update, options);
async function updateManyDocuments(databaseName, collectionName, filter, update, options);
async function deleteOneDocument(databaseName, collectionName, filter);
async function deleteManyDocuments(databaseName, collectionName, filter);
async function aggregateDocuments(databaseName, collectionName, pipeline, options);
```

# Discord Utils

[discordUtils](./discordUtils.md)

# Mongo DB Utils

[mongoUtils](./mongoUtils.md)