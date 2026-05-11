const { getCollection } = require("../collection.cjs");

/**
 * Remove um documento.
 *
 * @param {string} databaseName
 * @param {string} collectionName
 * @param {object} filter
 * @returns {Promise<object>}
 */
async function deleteOneDocument(databaseName, collectionName, filter) {
	const collection = await getCollection(databaseName, collectionName);

	return collection.deleteOne(filter);
}

/**
 * Remove vários documentos.
 *
 * @param {string} databaseName
 * @param {string} collectionName
 * @param {object} filter
 * @returns {Promise<object>}
 */
async function deleteManyDocuments(databaseName, collectionName, filter) {
	const collection = await getCollection(databaseName, collectionName);

	return collection.deleteMany(filter);
}

module.exports = {
	deleteOneDocument,
	deleteManyDocuments,
};
