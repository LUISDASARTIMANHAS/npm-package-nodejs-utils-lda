import { countDocuments } from "./operations/count.mjs";
import { deleteOneDocument } from "./operations/delete.mjs";
import { existsDocument } from "./operations/exists.mjs";
import { findDocuments } from "./operations/find.mjs";
import { insertDocument, insertManyDocuments } from "./operations/insert.mjs";
import { updateOneDocument } from "./operations/update.mjs";

/**
 * Cria um repository MongoDB.
 *
 * @param {Object} options Configurações do repository.
 * @param {string} options.database Nome do banco.
 * @param {string} options.collection Nome da collection.
 *
 * @returns {Object}
 */
export function createRepository({ database, collection }) {
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
		 * @param {Object} filter Filtro MongoDB.
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
		 * @param {Object} filter Filtro MongoDB.
		 * @returns {Promise<Object>}
		 */
		delete(filter) {
			return deleteOneDocument(database, collection, filter);
		},

		/**
		 * Conta documentos.
		 *
		 * @param {Object} filter Filtro MongoDB.
		 * @returns {Promise<number>}
		 */
		count(filter = {}) {
			return countDocuments(database, collection, filter);
		},

		/**
		 * Verifica se existe documento.
		 *
		 * @param {Object} filter Filtro MongoDB.
		 * @returns {Promise<boolean>}
		 */
		exists(filter = {}) {
			return existsDocument(database, collection, filter);
		},
	};
}
