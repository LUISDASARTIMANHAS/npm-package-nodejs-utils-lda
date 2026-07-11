const { countDocuments } = require("./operations/count.cjs");
const { deleteOneDocument } = require("./operations/delete.cjs");
const { existsDocument } = require("./operations/exists.cjs");
const { findDocuments } = require("./operations/find.cjs");
const { insertDocument, insertManyDocuments } = require("./operations/insert.cjs");
const { updateOneDocument } = require("./operations/update.cjs");

/**
 * Cria um repository MongoDB.
 *
 * @param {Object} options Configurações do repository.
 * @param {string} options.database Nome do banco.
 * @param {string} options.collection Nome da collection.
 *
 * @returns {Object}
 */
function createRepository({ database, collection }) {
	return {
		/**
		 * Busca documentos.
		 *
		 * @param {Object} filter Filtro MongoDB.
		 * @returns {Promise<Array>}
		 */
		find(filter = {}) {
			return findDocuments(database, collection, filter);
		},

		/**
		 * Insere um documento.
		 *
		 * @param {Object} data Documento.
		 * @returns {Promise<Object>}
		 */
		insert(data) {
			return insertDocument(database, collection, data);
		},

		/**
		 * Insere vários documentos.
		 *
		 * @param {Array<Object>} data Lista de documentos.
		 * @returns {Promise<Object>}
		 */
		insertMany(data = []) {
			return insertManyDocuments(database, collection, data);
		},

		/**
		 * Atualiza um documento.
		 *
		 * @param {Object} filter Filtro.
		 * @param {Object} data Dados novos.
		 * @returns {Promise<Object>}
		 */
		update(filter, data) {
			return updateOneDocument(
				database,
				collection,
				filter,
				{
					$set: data,
				},
				{
					upsert: true,
				},
			);
		},

		/**
		 * Remove documento.
		 *
		 * @param {Object} filter Filtro.
		 * @returns {Promise<Object>}
		 */
		delete(filter) {
			return deleteOneDocument(database, collection, filter);
		},

		/**
		 * Conta documentos.
		 *
		 * @param {Object} filter Filtro.
		 * @returns {Promise<number>}
		 */
		count(filter = {}) {
			return countDocuments(database, collection, filter);
		},

		/**
		 * Verifica existência.
		 *
		 * @param {Object} filter Filtro.
		 * @returns {Promise<boolean>}
		 */
		exists(filter = {}) {
			return existsDocument(database, collection, filter);
		},
	};
}

module.exports = {
	createRepository,
};
