# npm-package-nodejs-utils
Este projeto tem como fins de criar e abstrair módulos basicos e utilidades para o node js

requires
.env file
config.json file
data folder

automatic create requires folders and files.
automatic generation of AES + RSA KEYS FOR ENCRYPTION

## Functions
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
```

# user system
```js
insertUser(name,userdata);
return userdata saved
selectUser(ID);
return userdata
usersList();
return users ID,name
deleteUser(ID);
alterUser(ID, name, newUserData);
disableUser(ID);
reactivateUser(ID);
```

# mongo DB
```js
mongoConnect(connectionString)

// SET 'MONGO_CONNECTION_STRING' VARIABLE IN .ENV FILE FOR SECURE AND AUTOMATIC CONNECTION
mongoConnect()

// connection = await mongoConnect(connectionString);
select(connection, database, table)
return all data of selected table

insert(connection, database, table, data)

return mongoClient or connection
```

## Usage

````js
import { fopen, fwrite, generateToken, fetchGet } from "npm-package-nodejs-utils-lda";
const filePath = "database.json"
// Usando as funções
const data = fopen(filePath);

data.push("X");

fwrite(filePath, data);
const token = generateToken();
fetchGet("https://example.com",null, (onError,data)=>{
    if(onError){
        res.send(error);
    }
    res.send(data);
});


app.get("/baixar", (req, res) => {
  const fileUrl = "https://exemplo.com/arquivo.zip"; // URL do arquivo

  fetchDownloadStream(fileUrl, (err, fileStream) => {
    if (err) {
      return res.status(500).send("Erro ao baixar o arquivo.");
    }

    // Define o cabeçalho para download
    res.setHeader("Content-Disposition", 'attachment; filename="arquivo.zip"');
    res.setHeader("Content-Type", "application/octet-stream");

    // Envia o stream do arquivo para o cliente
    fileStream.pipe(res);
  });
});


# WSChat

## With Express (recommended)

If you already have an Express server, just pass the app instance to WSChat:

````js
import express from "express";
import WSChat from "./WSchat.lib.mjs"; // or require() for CommonJS

const app = express();

const server = WSChat(app, {
  welcomeMessage: "Hello! Welcome to the chat."
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
````

This creates the HTTP + WebSocket server using the same Express server.

## Without Express (standalone WebSocket server)

If you want to run WSChat alone, without Express:

````js
import WSChat from "./WSchat.lib.mjs";

WSChat(null, { port: 8080 }); // starts HTTP + WS server on port 8080
````

---

## Options

The second argument is an optional object with the following properties:

````js
{
  port: 8080,               // Number - Port to listen on if WSChat creates its own HTTP server (default 8080)
  welcomeMessage: "Welcome to WSChat!" // String - Message sent to clients immediately after connection
}
````
