require("dotenv/config");
const { MongoClient } = require("mongodb");
const { discordLogs } = require("./discordUtils/discordSender.cjs");

async function mongoConnect(connectionString) {
  let mongoClient;

  const AutoConnectionString = getAutoConnectionString(connectionString);

  try {
    mongoClient = new MongoClient(AutoConnectionString);
    discordLogs("MONGO DB CONNECTION", "Connecting to database cluster...");
    console.log("Connecting to database cluster...");
    await mongoClient.connect();
    discordLogs(
      "MONGO DB CONNECTION",
      "Connected to MongoDB Atlas successfully!",
    );
    console.log("Connected to MongoDB Atlas successfully!");

    return mongoClient;
  } catch (err) {
    discordLogs("ERR MONGO DB CONNECTION", err);
    console.error(`"MONGODB_ERR: ${err}`);
    process.exit();
  }
}

function getDatabase(client, databaseName) {
  // - Obtém o banco de dados "database" fornecido da conexão.
  return client.db(databaseName);
}

function getTable(database, tableName) {
  // - Obtém a coleção "collection" fornecida do banco de dados.
  return database.collection(tableName);
}

function getALLData(table) {
  // - Realiza uma consulta para encontrar todos os documentos da coleção e retorna os resultados como um array.
  return table.find().toArray();
}

function getAutoConnectionString(connectionString) {
  let autoConnectionString = null;
  if (!connectionString) {
    console.log("USING .ENV FILES AUTOMATICALLY!");
    autoConnectionString = process.env.MONGO_CONNECTION_STRING;
  } else {
    autoConnectionString = connectionString;
    console.warn(
      "SET 'MONGO_CONNECTION_STRING' VARIABLE IN .ENV FILE FOR SECURE AND AUTOMATIC CONNECTION",
    );
  }
  return autoConnectionString;
}

async function select(client, databaseName, tableName) {
  // - Obtém o banco de dados "database" fornecido da conexão.
  const db = getDatabase(client, databaseName);
  // - Obtém a coleção "collection" fornecida do banco de dados.
  const table = getTable(db, tableName);
  // - Realiza uma consulta para encontrar todos os documentos da coleção e retorna os resultados como um array.
  return getALLData(table);
}

async function selectAuto(databaseName, tableName) {
  const connection = await mongoConnect();
  return await select(connection, databaseName, tableName);
}

async function insert(connection, databaseName, tableName, data) {
  // - Obtém o banco de dados "database" fornecido da conexão.
  const db = getDatabase(client, databaseName);
  // - Obtém a coleção "collection" fornecida do banco de dados.
  const table = getTable(db, tableName);
  // - Insere um novo documento (data) na coleção (table) e retorna um objeto com informações sobre a inserção.
  return table.insertOne(data);
}

async function insertAuto(databaseName, tableName, data) {
  const connection = await mongoConnect();
  return await insert(connection, databaseName, tableName, data);
}

module.exports = { mongoConnect, select, selectAuto, insert, insertAuto };
