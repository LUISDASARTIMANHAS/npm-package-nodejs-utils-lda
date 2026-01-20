import sendMail from "../emailModule.mjs";

/**
 * Envia código OTP usando o sistema de e-mail da lib
 * @param {string} email
 * @param {string} code
 * @return {Promise<void>}
 */
export function sendOTP(email, code) {
	return new Promise((resolve, reject) => {
		const subject = "Your access code";
		const text =
			`Your verification code is:\n\n` +
			`${code}\n\n` +
			`This code expires in 5 minutes.`;

		sendMail(email, subject, text, (err) => {
			if (err) return reject(err);
			resolve();
		});
	});
}
