/**
 * Valida username
 * @param {string} username
 */
export function validateUsername(username) {
	if (!username || typeof username !== "string") {
	throw new Error("Username inválido");
	}

	if (username.length < 3 || username.length > 32) {
	throw new Error("Username deve ter entre 3 e 32 caracteres");
	}

	if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
	throw new Error("Username contém caracteres inválidos");
	}
}

/**
 * Valida email
 * @param {string} email
 */
export function validateEmail(email) {
	if (!email) return;

	const emailRegex =
	/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	if (!emailRegex.test(email)) {
	throw new Error("Email inválido");
	}
}