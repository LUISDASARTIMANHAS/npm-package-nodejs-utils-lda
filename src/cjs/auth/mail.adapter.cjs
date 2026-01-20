// cjs\auth\mail.adapter.cjs
const sendMail = require("../emailModule.cjs");

/**
 * Envia código OTP usando o sistema de e-mail da lib
 * @param {string} email
 * @param {string} code
 * @return {Promise<void>}
 */
function sendOTP(email, code) {
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

module.exports = { sendOTP };
