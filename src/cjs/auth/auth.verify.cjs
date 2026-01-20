const { hashOTP } = require("./otp.service.cjs");
const { getOTP, deleteOTP } = require("./otp.store.cjs");
const { generateToken } = require("../utils.cjs");

/**
 * Verifica código OTP e gera token de sessão
 * @param {string} email
 * @param {string} code
 * @return {Promise<{ token: string, email: string }>}
 */
async function verifyAuthCode(email, code) {
	const data = getOTP(email);

	if (!data) {
		throw new Error("Code does not exist.");
	}

	if (Date.now() > data.expiresAt) {
		deleteOTP(email);
		throw new Error("Expired code.");
	}

	const hash = hashOTP(code);

	if (hash !== data.hash) {
		throw new Error("Invalid code.");
	}

	deleteOTP(email);

	const token = generateToken();

	return {
		token,
		email
	};
}

module.exports = { verifyAuthCode };
