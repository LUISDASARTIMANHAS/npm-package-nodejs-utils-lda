const { getCollection } = require("../collection.cjs");

/**
 * Conta documentos.
 *
 * @param {string} databaseName
 * @param {string} collectionName
 * @param {object} [query={}]
 * @returns {Promise<number>}
 */
async function countDocuments(databaseName, collectionName, query = {}) {
	const collection = await getCollection(databaseName, collectionName);

	return collection.countDocuments(query);
}

module.exports = {
	countDocuments,
};
