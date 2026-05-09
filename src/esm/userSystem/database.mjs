import fs from "fs";
import path from "path";
import { freadBin, fwriteBin } from "../autoFileSysModule.cjs";

const DATA_DIR = path.resolve("./data");
const USERS_PATH = path.join(DATA_DIR, "users.bin");

/**
 * Inicializa banco
 */
export function initDatabase() {
	if (!fs.existsSync(DATA_DIR)) {
		fs.mkdirSync(DATA_DIR, { recursive: true });
	}

	if (!fs.existsSync(USERS_PATH)) {
		fwriteBin(USERS_PATH, []);
	}
}

/**
 * Lê usuários
 * @returns {Array}
 */
export function readUsers() {
	return freadBin(USERS_PATH);
}

/**
 * Salva usuários
 * @param {Array} users
 */
export function writeUsers(users) {
	fwriteBin(USERS_PATH, users);
}

export { USERS_PATH };
