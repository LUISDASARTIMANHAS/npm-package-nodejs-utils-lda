import express from "express";
import { httpInternalServerError } from "../router/exceptionAPI.mjs";
const storageRouter = express.Router();

storageRouter.post("/upload", async (req, res) => {
  try {
    return res.json({
      success: true,
    });
  } catch (err) {
    return httpInternalServerError(res,null,err);
  }
});

storageRouter.get("/", async (req, res) => {
  try {
    return res.send("Storage API is running!");
  } catch (err) {
    return httpInternalServerError(res,null,err);
  }
});

storageRouter.delete("/delete", async (req, res) => {
  try {
    return res.send("Storage API is running!");
  } catch (err) {
    return httpInternalServerError(res,null,err);
  }
});

export default storageRouter;
