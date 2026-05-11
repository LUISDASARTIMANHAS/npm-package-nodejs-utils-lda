import { getCollection } from "../collection.mjs";

/**
 * Remove um documento.
 *
 * @param {string} databaseName
 * @param {string} collectionName
 * @param {object} filter
 * @returns {Promise<object>}
 */
export async function deleteOneDocument(databaseName, collectionName, filter) {
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
export async function deleteManyDocuments(
	databaseName,
	collectionName,
	filter,
) {
	const collection = await getCollection(databaseName, collectionName);

	return collection.deleteMany(filter);
}
