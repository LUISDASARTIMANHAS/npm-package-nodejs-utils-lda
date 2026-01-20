import { hashOTP } from "./otp.service.mjs";
import { getOTP, deleteOTP } from "./otp.store.mjs";
import { generateToken } from "../utils.mjs";

/**
 * Verifica código OTP e gera token de sessão
 * @param {string} email
 * @param {string} code
 * @return {Promise<{ token: string, email: string }>}
 */
export async function verifyAuthCode(email, code) {
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
