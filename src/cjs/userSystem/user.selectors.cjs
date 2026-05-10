const {
	readUsers,
} = require("./database.cjs");

/**
 * Busca usuário por ID
 * @param {string} id
 */
function selectUserByID(id) {
	const users = readUsers();

	return (
		users.find((u) => u.id === id) ||
		null
	);
}

/**
 * Busca usuário por username
 * @param {string} email
 */
function selectUserByEmail(email) {
	const users = readUsers();

	return users.find((u) => u.email === email) || null;
}

/**
 * Busca usuário por username
 * @param {string} username
 */
function selectUserByUsername(
	username,
) {
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
function listUsers() {
	return readUsers();
}

/**
 * Lista ativos
 */
function listActiveUsers() {
	return readUsers().filter(
		(u) => u.ativo,
	);
}

module.exports = {
	selectUserByID,
	selectUserByEmail,
	selectUserByUsername,
	listUsers,
	listActiveUsers,
};