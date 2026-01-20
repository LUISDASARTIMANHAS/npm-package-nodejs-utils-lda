import sendMail from "../emailModule.mjs";

/**
 * Envia código OTP usando o sistema de e-mail da lib
 * @param {string} email
 * @param {string} code
 * @return {Promise<void>}
 */
export function sendOTP(email, code) {
	return new Promise((resolve, reject) => {
		const subject = "Seu código de acesso";
		const text =
			`Seu código de verificação é:\n\n` +
			`${code}\n\n` +
			`Esse código expira em 5 minutos.`;

		sendMail(email, subject, text, (err) => {
			if (err) return reject(err);
			resolve();
		});
	});
}
