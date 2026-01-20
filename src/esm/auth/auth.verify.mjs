import { hashOTP } from "./otp.service.mjs";
import { getOTP, deleteOTP } from "./otp.store.mjs";

/**
 * Verifica código OTP
 * @param {string} email
 * @param {string} code
 * @return {Promise<boolean>}
 */
export async function verifyAuthCode(email, code) {
	const data = getOTP(email);

	if (!data) {
		throw new Error("Code does not exist.");
	}

	if (Date.now() > data.expiresAt) {
		deleteOTP(email);
		throw new Error("Expired code");
	}

	const hash = hashOTP(code);

	if (hash !== data.hash) {
		throw new Error("Invalid code");
	}

	deleteOTP(email);
	return true;
}
