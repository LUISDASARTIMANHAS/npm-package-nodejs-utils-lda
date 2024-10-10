import "./autoFileSysModule.js";
import "./checkHeaderMiddleware.js";
import "./emailModule.js";
import "./fetchModule.js";
import "./httpsSecurity.js";


module.exports = {
    fopen, fwrite, freadBin, fwriteBin, saveFile,
    checkHeaderMiddleware,
    sendMail,
    fetchGet, fetchPost,
    httpsSecurityMiddleware
}