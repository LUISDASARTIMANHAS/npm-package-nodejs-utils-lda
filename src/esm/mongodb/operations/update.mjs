import { getCollection } from "../collection.mjs";

/**
 * Atualiza um documento.
 *
 * @param {string} databaseName
 * @param {string} collectionName
 * @param {object} filter
 * @param {object} update
 * @param {object} [options={}]
 * @returns {Promise<object>}
 */
export async function updateOneDocument(
	databaseName,
	collectionName,
	filter,
	update,
	options = {},
) {
	const collection = await getCollection(databaseName, collectionName);

	return collection.updateOne(filter, update, options);
}

/**
 * Atualiza vários documentos.
 *
 * @param {string} databaseName
 * @param {string} collectionName
 * @param {object} filter
 * @param {object} update
 * @param {object} [options={}]
 * @returns {Promise<object>}
 */
export async function updateManyDocuments(
	databaseName,
	collectionName,
	filter,
	update,
	options = {},
) {
	const collection = await getCollection(databaseName, collectionName);

	return collection.updateMany(filter, update, options);
}
