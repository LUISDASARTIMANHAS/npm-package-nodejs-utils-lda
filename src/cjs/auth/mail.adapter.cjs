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

module.exports = { sendOTP };
