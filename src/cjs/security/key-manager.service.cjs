const fs = require("fs");
const path = require("path");
const { generateKeyPairSync } = require("crypto");

const KEYS_DIR = path.resolve("./bk-keys");
const PRIVATE_KEY_PATH = path.join(KEYS_DIR, "private.pem");
const PUBLIC_KEY_PATH = path.join(KEYS_DIR, "public.pem");

/**
 * Garante que o par de chaves RSA exista no sistema
 *
 * @returns {{ privateKeyPem: string, publicKeyPem: string }}
 */
function ensureRSAKeys() {
  if (!fs.existsSync(KEYS_DIR)) {
    fs.mkdirSync(KEYS_DIR, { recursive: true });
  }

  const hasPrivate = fs.existsSync(PRIVATE_KEY_PATH);
  const hasPublic = fs.existsSync(PUBLIC_KEY_PATH);

  if (!hasPrivate || !hasPublic) {
    const { publicKey, privateKey } = generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: "spki",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
      },
    });

    fs.writeFileSync(PRIVATE_KEY_PATH, privateKey);
    fs.writeFileSync(PUBLIC_KEY_PATH, publicKey);

    // Opcional: exportar chave pública para frontend
    if (!fs.existsSync("public")) {
      fs.mkdirSync("public");
    }
    fs.writeFileSync("public/public.pem", publicKey);

    console.log("🔐 Chaves RSA geradas automaticamente");
  }

  return {
    privateKeyPem: fs.readFileSync(PRIVATE_KEY_PATH, "utf8"),
    publicKeyPem: fs.readFileSync(PUBLIC_KEY_PATH, "utf8"),
  };
}

module.exports = {
  ensureRSAKeys,
};
