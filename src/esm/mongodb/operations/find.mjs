import { getCollection } from "../collection.mjs";

/**
 * Busca vários documentos.
 *
 * @param {string} databaseName
 * @param {string} collectionName
 * @param {object} [query={}]
 * @param {object} [options={}]
 * @returns {Promise<Array>}
 */
export async function findDocuments(
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
export async function findOneDocument(
	databaseName,
	collectionName,
	query = {},
	options = {},
) {
	const collection = await getCollection(databaseName, collectionName);

	return collection.findOne(query, options);
}
