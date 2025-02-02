# npm-package-nodejs-utils
Este projeto tem como fins de criar e abstrair módulos basicos e utilidades para o node js

requires
.env file
config.json file

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
fetchPost(url, payload, header, function(error,data));
httpsSecurityMiddleware(req, res, next)
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

// user system
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

## config.json
```json
{
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
```