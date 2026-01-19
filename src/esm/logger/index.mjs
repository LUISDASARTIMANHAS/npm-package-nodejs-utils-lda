import { baseLog } from "./core.mjs";

/**
 * Log padrão
 * @param {any} message
 * @param {string} filename
 * @param {number} maxLength
 * @return {void}
 */
export function log(message, filename, maxLength) {
	baseLog({
		message,
		filename,
		maxLength,
		level: "info",
		consoleFn: console.log,
	});
}

/**
 * Log de erro
 * @param {any} message
 * @param {string} filename
 * @param {number} maxLength
 * @return {void}
 */
export function logError(message, filename, maxLength) {
	baseLog({
		message,
		filename,
		maxLength,
		level: "error",
		consoleFn: console.error,
	});
}
