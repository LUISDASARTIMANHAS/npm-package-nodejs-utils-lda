
## Functions

lista de funções disponiveis na blibioteca npm-package-nodejs-utils-lda

```js
function fopen(filePath);
function fwrite(filePath, data);
function fwriteBin(filePath, data);
function stringToBinary(str, binaryLenght);
function freadBin(filePath);
function binaryToString(binary, binaryLenght);
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
function autoLoader(app);
function spaceUsed(space, used);
function serverTry(res,callback)
function sendFileToDiscord(file, webhookUrl);
function log(message, filepath = "logs.txt", maxLength = 100);
async function requestAuthCode(email, ttlMin = 5);
function getOTP(email);
function deleteOTP(email);
function saveOTP(email, hash, expiresAt);
async function verifyAuthCode(email, code);
function StatusDashboard(app);
```