require("./autoFileSysModule.js");
require("./checkHeaderMiddleware.js");
require("./emailModule.js");
require("./fetchModule.js");
require("./httpsSecurity.js");


module.exports = {
    fopen, fwrite, freadBin, fwriteBin, saveFile,
    checkHeaderMiddleware,
    sendMail,
    fetchGet, fetchPost,
    httpsSecurityMiddleware
}