require("dotenv/config");
const { MongoClient } = require("mongodb");
const { discordLogs } = require("./fetchModule.cjs");

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

async function select(connection, database, table) {
  // - Obtém o banco de dados "database" fornecido da conexão.
  const db = connection.db(database);
  // - Obtém a coleção "collection" fornecida do banco de dados.
  const colecao = db.collection(table);
  // - Realiza uma consulta para encontrar todos os documentos da coleção e retorna os resultados como um array.
  return colecao.find().toArray();
}

async function insert(connection, database, table, data) {
  // - Obtém o banco de dados "database" fornecido da conexão.
  const db = connection.db(database);
  // - Obtém a coleção "table" fornecido do banco de dados.
  const colecao = db.collection(table);
  // - Insere um novo documento (data) na coleção (table) e retorna um objeto com informações sobre a inserção.
  return colecao.insertOne(data);
}

module.exports = { mongoConnect, select, insert };
