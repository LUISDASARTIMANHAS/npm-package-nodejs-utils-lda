/**
 * Valida username
 * @param {string} username
 */
function validateUsername(username) {
	if (!username || typeof username !== "string") {
		throw new Error("Username inválido");
	}

	if (username.length < 3) {
		throw new Error(
			"Username muito pequeno",
		);
	}

	if (username.length > 32) {
		throw new Error(
			"Username muito grande",
		);
	}

	if (
		!/^[a-zA-Z0-9_.-]+$/.test(username)
	) {
		throw new Error(
			"Username contém caracteres inválidos",
		);
	}
}

/**
 * Valida email
 * @param {string} email
 */
function validateEmail(email) {
	if (!email) return;

	const regex =
		/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	if (!regex.test(email)) {
		throw new Error("Email inválido");
	}
}

module.exports = {
	validateUsername,
	validateEmail,
};