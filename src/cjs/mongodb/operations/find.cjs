const { getCollection } = require("../collection.cjs");

/**
 * Busca vários documentos.
 *
 * @param {string} databaseName
 * @param {string} collectionName
 * @param {object} [query={}]
 * @param {object} [options={}]
 * @returns {Promise<Array>}
 */
async function findDocuments(
  databaseName,
  collectionName,
  query = {},
  options = {},
) {
  const collection = await getCollection(databaseName, collectionName);

  return collection.find(query, options).toArray();
}

/**
 * Busca um documento.
 *
 * @param {string} databaseName
 * @param {string} collectionName
 * @param {object} [query={}]
 * @param {object} [options={}]
 * @returns {Promise<object|null>}
 */
async function findOneDocument(
  databaseName,
  collectionName,
  query = {},
  options = {},
) {
  const collection = await getCollection(databaseName, collectionName);

  return collection.findOne(query, options);
}

module.exports = {
  findDocuments,
  findOneDocument,
};
