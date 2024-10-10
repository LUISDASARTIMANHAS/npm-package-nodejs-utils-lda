require("./autoFileSysModule.js");
require("./checkHeaderMiddleware.js");
require("./emailModule.js");
require("./fetchModule.js");
require("./httpsSecurity.js");
require("./utils.js");


module.exports = {
    fopen, fwrite, freadBin, fwriteBin,
    checkHeaderMiddleware,
    sendMail,
    fetchGet, fetchPost,
    httpsSecurityMiddleware,
    getRandomInt,getRandomBin,getRandomHex,generateToken,ordenarUsuario,pesqUsuario,validadeApiKey,unauthorized,forbidden,formatDate,conversorSimEnao,
}