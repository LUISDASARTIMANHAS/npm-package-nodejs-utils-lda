import express from "express";
const storageRouter = express.Router();

storageRouter.post("/upload", async (req, res) => {
  try {
    return res.json({
      success: true,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "500 - INTERNAL SERVER ERROR" });
  }
});

storageRouter.get("/", async (req, res) => {
  try {
    return res.send("Storage API is running!");
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "500 - INTERNAL SERVER ERROR" });
  }
});

storageRouter.delete("/delete", async (req, res) => {
  try {
    return res.send("Storage API is running!");
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "500 - INTERNAL SERVER ERROR" });
  }
});

export default storageRouter;
