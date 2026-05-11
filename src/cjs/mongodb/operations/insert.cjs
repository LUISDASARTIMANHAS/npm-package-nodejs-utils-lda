const { getCollection } = require("../collection.cjs");

/**
 * Insere um documento.
 *
 * @param {string} databaseName
 * @param {string} collectionName
 * @param {object} data
 * @returns {Promise<object>}
 */
async function insertDocument(databaseName, collectionName, data) {
  if (!data || typeof data !== "object") {
    throw new TypeError("Data must be object");
  }

  const collection = await getCollection(databaseName, collectionName);

  return collection.insertOne(data);
}

/**
 * Insere vários documentos.
 *
 * @param {string} databaseName
 * @param {string} collectionName
 * @param {Array<object>} data
 * @returns {Promise<object>}
 */
async function insertManyDocuments(databaseName, collectionName, data) {
  if (!Array.isArray(data)) {
    throw new TypeError("Data must be array");
  }

  const collection = await getCollection(databaseName, collectionName);

  return collection.insertMany(data);
}

module.exports = {
  insertDocument,
  insertManyDocuments,
};
