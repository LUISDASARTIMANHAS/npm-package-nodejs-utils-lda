const { findOneDocument } = require("./find.cjs");

/**
 * Verifica existência de documento.
 *
 * @param {string} databaseName
 * @param {string} collectionName
 * @param {object} query
 * @returns {Promise<boolean>}
 */
async function existsDocument(databaseName, collectionName, query) {
	const result = await findOneDocument(databaseName, collectionName, query, {
		projection: {
			_id: 1,
		},
	});

	return !!result;
}

module.exports = {
	existsDocument,
};
