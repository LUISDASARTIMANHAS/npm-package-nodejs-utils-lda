
## Functions

lista de funções disponiveis na blibioteca npm-package-nodejs-utils-lda

```js
fopen(filePath);
fwrite(filePath, data);
fwriteBin(filePath, data);
stringToBinary(str, binaryLenght);
freadBin(filePath);
binaryToString(binary, binaryLenght);
checkHeaderMiddleware(app);
sendMail(email, subject, text, function(error,data));
fetchGet(url, header, callback);
fetchDownloadStream(url, callback);
fetchPost(url, payload, header, function(error,data));
// only JSON
fetchPostJson(url, payload, header, callback);
httpsSecurityMiddleware(req, res, next);
setCacheHeaders(req, res, next);
getRandomInt(max);
getRandomBin(max);
getRandomHex(max);
generateToken();
validadeApiKey(req,res,key);
forbidden(res);
unauthorized(res);
notfound(res);
discordLogs(title, message)
autoLoader(app);
spaceUsed(space, used);
serverTry(res,callback)
sendFileToDiscord(file, webhookUrl);
log(message, filepath = "logs.txt", maxLength = 100);
async function requestAuthCode(email, ttlMin = 5);
function getOTP(email);
function deleteOTP(email);
function saveOTP(email, hash, expiresAt);
```