import { getCollection } from "../collection.mjs";

/**
 * Conta documentos.
 *
 * @param {string} databaseName
 * @param {string} collectionName
 * @param {object} [query={}]
 * @returns {Promise<number>}
 */
export async function countDocuments(databaseName, collectionName, query = {}) {
	const collection = await getCollection(databaseName, collectionName);

	return collection.countDocuments(query);
}
