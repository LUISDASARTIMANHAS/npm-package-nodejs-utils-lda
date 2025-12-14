import forge from "node-forge";
import crypto from "crypto";
import { ensureRSAKeys } from "./key-manager.service.mjs";

// Inicializa chaves
const { privateKeyPem } = ensureRSAKeys();
const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);

/**
 * Descriptografa a chave AES usando RSA-OAEP + SHA-256
 * @param {string} encryptedKeyB64
 * @returns {Buffer}
 */
export function decryptAESKey(encryptedKeyB64) {
  const encryptedBytes = forge.util.decode64(encryptedKeyB64);
  const decrypted = privateKey.decrypt(encryptedBytes, "RSA-OAEP", {
    md: forge.md.sha256.create(),
  });
  return Buffer.from(decrypted, "binary");
}

/**
 * Descriptografa dados usando AES-256-GCM
 * @param {string} encryptedDataB64
 * @param {Buffer} key
 * @param {string} ivB64
 * @param {string} authTagB64
 * @returns {string}
 */
export function decryptAESGCM(encryptedDataB64, key, ivB64, authTagB64) {
  const encrypted = Buffer.from(encryptedDataB64, "base64");
  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(authTagB64, "base64");

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, null, "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
