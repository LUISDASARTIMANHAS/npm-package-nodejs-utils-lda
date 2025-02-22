require("dotenv/config");
const { MongoClient } = require("mongodb");
const { discordLogs } = require("npm-package-nodejs-utils-lda");

async function mongoConnect(connectionString) {
  let mongoClient, srv;

  if (!connectionString) {
    console.log("USING .ENV FILES AUTOMATICALLY!");
    srv = process.env.MONGO_CONNECTION_STRING;
  } else {
    srv = connectionString;
    console.warn(
      "SET 'MONGO_CONNECTION_STRING' VARIABLE IN .ENV FILE FOR SECURE AND AUTOMATIC CONNECTION"
    );
  }

  try {
    mongoClient = new MongoClient(srv);
    discordLogs("MONGO DB CONNECTION", "Connecting to database cluster...");
    console.log("Connecting to database cluster...");
    await mongoClient.connect();
    discordLogs(
      "MONGO DB CONNECTION",
      "Connected to MongoDB Atlas successfully!"
    );
    console.log("Connected to MongoDB Atlas successfully!");

    return mongoClient;
  } catch (err) {
    discordLogs("ERR MONGO DB CONNECTION", err);
    console.error(`"MONGODB_ERR: ${err}`);
    process.exit();
  }
}

module.exports = mongoConnect;
