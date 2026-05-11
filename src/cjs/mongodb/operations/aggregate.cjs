const { getCollection } = require("../collection.cjs");

/**
 * Executa aggregate pipeline.
 *
 * @param {string} databaseName
 * @param {string} collectionName
 * @param {Array<object>} pipeline
 * @param {object} [options={}]
 * @returns {Promise<Array>}
 */
async function aggregateDocuments(
	databaseName,
	collectionName,
	pipeline = [],
	options = {},
) {
	const collection = await getCollection(databaseName, collectionName);

	return collection.aggregate(pipeline, options).toArray();
}

module.exports = {
	aggregateDocuments,
};
