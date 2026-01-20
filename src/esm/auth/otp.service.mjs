import crypto from "crypto";

/**
 * Gera um código OTP numérico
 * @param {number} length
 * @return {string}
 */
export function generateOTP(length = 6) {
	return crypto
		.randomInt(0, 10 ** length)
		.toString()
		.padStart(length, "0");
}

/**
 * Cria hash seguro do OTP
 * @param {string} otp
 * @return {string}
 */
export function hashOTP(otp) {
	return crypto.createHash("sha256").update(otp).digest("hex");
}
