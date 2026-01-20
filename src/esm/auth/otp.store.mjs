/**
 * Store de OTP em memória
 * Pode ser substituído por Redis / DB
 */
const store = new Map();

/**
 * Salva OTP
 * @param {string} email
 * @param {string} hash
 * @param {number} expiresAt
 * @return {void}
 */
export function saveOTP(email, hash, expiresAt) {
	store.set(email, { hash, expiresAt });
}

/**
 * Obtém OTP salvo
 * @param {string} email
 * @return {{hash: string, expiresAt: number}|null}
 */
export function getOTP(email) {
	return store.get(email) || null;
}

/**
 * Remove OTP
 * @param {string} email
 * @return {void}
 */
export function deleteOTP(email) {
	store.delete(email);
}
