import { getCollection } from "../collection.mjs";

/**
 * Executa aggregate pipeline.
 *
 * @param {string} databaseName
 * @param {string} collectionName
 * @param {Array<object>} pipeline
 * @param {object} [options={}]
 * @returns {Promise<Array>}
 */
export async function aggregateDocuments(
	databaseName,
	collectionName,
	pipeline = [],
	options = {},
) {
	const collection = await getCollection(databaseName, collectionName);

	return collection.aggregate(pipeline, options).toArray();
}
