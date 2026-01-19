import fs from "fs";
import path from "path";

/**
 * Garante que o diretório exista
 * @param {string} dir
 * @return {void}
 */
function ensureDir(dir) {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
}

/**
 * Normaliza e limita o tamanho da mensagem
 * @param {any} message
 * @param {number} maxLength
 * @return {string}
 */
function normalizeMessage(message, maxLength) {
	let msg = typeof message === "string" ? message : String(message);

	if (msg.length > maxLength) {
		msg = `${msg.slice(0, maxLength)}… [TRUNCADO]`;
	}

	return msg;
}

/**
 * Escreve mensagem no arquivo de log
 * @param {string} filepath
 * @param {string} message
 * @return {void}
 */
function writeLogFile(filepath, message) {
	const oldContent = fopen(filepath);
	fwrite(filepath, `${oldContent} ${message}\n`);
}

/**
 * Função base de log
 * @param {Object} options
 * @param {any} options.message
 * @param {string} options.filename
 * @param {number} options.maxLength
 * @param {string} options.level
 * @param {(msg: string) => void} options.consoleFn
 * @return {void}
 */
export function baseLog({
	message,
	filename = "logs.txt",
	maxLength = 100,
	level = "info",
	consoleFn = console.log,
}) {
	const logsDir = path.join("logs");
	ensureDir(logsDir);

	const filepath = path.join(logsDir, filename);

	const normalized = normalizeMessage(message, maxLength);
	const finalMessage = `\t[npm-package-nodejs-utils-lda] [${level}] ${normalized}`;

	writeLogFile(filepath, finalMessage);
	consoleFn(finalMessage);
}
