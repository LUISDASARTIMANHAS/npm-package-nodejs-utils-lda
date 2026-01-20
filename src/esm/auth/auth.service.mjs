import { generateOTP, hashOTP } from "./otp.service.mjs";
import { saveOTP } from "./otp.store.mjs";
import { sendOTP } from "./mail.adapter.mjs";

/**
 * Solicita código OTP
 * @param {string} email
 * @param {number} ttlMin
 * @return {Promise<void>}
 */
export async function requestAuthCode(email, ttlMin = 5) {
  if (!email) {
    throw new Error("Email obrigatório");
  }

  const otp = generateOTP(6);
  const hash = hashOTP(otp);
  const expiresAt = Date.now() + ttlMin * 60 * 1000;

  saveOTP(email, hash, expiresAt);
  await sendOTP(email, otp);
}
