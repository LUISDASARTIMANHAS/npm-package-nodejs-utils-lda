const express = require("express");
const { sendAPIError } = require("../router/exceptionAPI.cjs");
const storageRouter = express.Router();

storageRouter.post("/upload", async (req, res) => {
  try {
    return res.json({
      success: true,
    });
  } catch (err) {
    console.error(err);
    return sendAPIError(res, 500, "INTERNAL SERVER ERROR");
  }
});

storageRouter.get("/", async (req, res) => {
  try {
    return res.send("Storage API is running!");
  } catch (err) {
    console.error(err);
    return sendAPIError(res, 500, "INTERNAL SERVER ERROR");
  }
});

storageRouter.delete("/delete", async (req, res) => {
  try {
    return res.send("Storage API is running!");
  } catch (err) {
    console.error(err);
    return sendAPIError(res, 500, "INTERNAL SERVER ERROR");
  }
});

module.exports = storageRouter;