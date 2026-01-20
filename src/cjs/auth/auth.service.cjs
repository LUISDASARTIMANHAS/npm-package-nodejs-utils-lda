// cjs\auth\auth.service.cjs
const { generateOTP, hashOTP } = require("./otp.service.cjs");
const { saveOTP } = require("./otp.store.cjs");
const { sendOTP } = require("./mail.adapter.cjs");

/**
 * Solicita código OTP
 * @param {string} email
 * @param {number} ttlMs
 * @return {Promise<void>}
 */
async function requestAuthCode(email, ttlMin = 5) {
  if (!email) {
    throw new Error("Email required");
  }

  const otp = generateOTP(6);
  const hash = hashOTP(otp);
  const expiresAt = Date.now() + ttlMin*60*1000;

  saveOTP(email, hash, expiresAt);
  await sendOTP(email, otp);
}

module.exports = { requestAuthCode };
