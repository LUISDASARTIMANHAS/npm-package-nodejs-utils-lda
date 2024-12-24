# npm-package-nodejs-utils
Este projeto tem como fins de criar e abstrair módulos basicos e utilidades para o node js

requires
.env file
config.json file

## Functions
```js
fopen(filePath)
fwrite(filePath, data)
fwriteBin(filePath, data)
stringToBinary(str, binaryLenght)
freadBin(filePath)
binaryToString(binary, binaryLenght)
checkHeaderMiddleware(app)
sendMail(email, subject, text, callback)
fetchGet(url, header, callback)
fetchPost(url, payload, header, callback function(error,data))
httpsSecurityMiddleware(req, res, next)
getRandomInt(max)
getRandomBin(max)
getRandomHex(max)
generateToken()
getRandomHex(max)
validadeApiKey(req,res,key)
forbidden(res)
unauthorized(res)
notfound(res)
discordLogs(title, message)
autoLoader(app)
spaceUsed(space, used)
```

## config.json
```json
{
    "wsSystem":{
        "portWS":2255,
        "enabled":true,
        "WSS":false
    },
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "emailSystem":{
        "service": "Gmail",
        "host":null,
        "port":null,
        "ssl_tls":true
    }
}
```

## Usage

````js
import { fopen, fwrite, generateToken, fetchGet } from "meu-pacote";
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
```