import { readUsers } from "./database.mjs";

/**
 * Busca usuário por ID
 * @param {string} id
 */
export function selectUserByID(id) {
	const users = readUsers();

	return users.find((u) => u.id === id) || null;
}

/**
 * Busca usuário por username
 * @param {string} email
 */
export function selectUserByEmail(email) {
	const users = readUsers();

	return users.find((u) => u.email === email) || null;
}

/**
 * Busca usuário por username
 * @param {string} username
 */
export function selectUserByUsername(username) {
	const users = readUsers();

	return (
		users.find(
			(u) =>
				u.username.toLowerCase() ===
				username.toLowerCase(),
		) || null
	);
}

/**
 * Lista usuários
 */
export function listUsers() {
	return readUsers();
}

/**
 * Lista somente ativos
 */
export function listActiveUsers() {
	return readUsers().filter((u) => u.ativo);
}