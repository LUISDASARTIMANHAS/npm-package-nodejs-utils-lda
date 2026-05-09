const fs = require("fs");
const path = require("path");

const { freadBin, fwriteBin } = require("../autoFileSysModule.cjs");

const DATA_DIR = path.resolve("./data");
const USERS_PATH = path.join(DATA_DIR, "users.bin");

/**
 * Inicializa banco
 */
function initDatabase() {
	if (!fs.existsSync(DATA_DIR)) {
	fs.mkdirSync(DATA_DIR, {
		recursive: true,
	});
	}

	if (!fs.existsSync(USERS_PATH)) {
	fwriteBin(USERS_PATH, []);
	}
}

/**
 * Lê usuários
 * @returns {Array}
 */
function readUsers() {
	return freadBin(USERS_PATH);
}

/**
 * Salva usuários
 * @param {Array} users
 */
function writeUsers(users) {
	fwriteBin(USERS_PATH, users);
}

module.exports = {
	USERS_PATH,
	initDatabase,
	readUsers,
	writeUsers,
};
