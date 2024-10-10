const {fopen, fwrite, freadBin, fwriteBin, saveFile} = require("./autoFileSysModule.js");
const checkHeaderMiddleware = require("./checkHeaderMiddleware.js");
const sendMail = require("./emailModule.js");
const {fetchGet, fetchPost} = require("./fetchModule.js");
const httpsSecurityMiddleware = require("./httpsSecurity.js");


module.exports = {
    fopen, fwrite, freadBin, fwriteBin, saveFile,
    checkHeaderMiddleware,
    sendMail,
    fetchGet, fetchPost,
    httpsSecurityMiddleware
}