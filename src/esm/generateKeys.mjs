import { generateKeyPairSync } from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// 🔧 Resolver __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ fopen substituído por leitura direta (ajuste conforme necessário)
const config = JSON.parse(
  fs.readFileSync(path.join(__dirname, "config.json"), "utf8")
);

checkConfigIntegrity();

if (config.useEncryptationAES_RSA) {
  const keysDir = path.join(__dirname, "keys");

  if (!fs.existsSync(keysDir)) {
    fs.mkdirSync(keysDir);

    const { publicKey, privateKey } = generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });

    fs.writeFileSync(path.join(keysDir, "public.pem"), publicKey);
    fs.writeFileSync(path.join(keysDir, "private.pem"), privateKey);

    console.log("🔐 Chaves RSA geradas em ./keys");
  } else {
    const pubKeyPath = path.join(keysDir, "public.pem");
    const privKeyPath = path.join(keysDir, "private.pem");

    if (!fs.existsSync(pubKeyPath) || !fs.existsSync(privKeyPath)) {
      const { publicKey, privateKey } = generateKeyPairSync("rsa", {
        modulusLength: 2048,
        publicKeyEncoding: { type: "spki", format: "pem" },
        privateKeyEncoding: { type: "pkcs8", format: "pem" },
      });

      fs.writeFileSync(pubKeyPath, publicKey);
      fs.writeFileSync(privKeyPath, privateKey);

      console.log("🔐 Chaves RSA geradas em ./keys");
    }
  }
}

function checkConfigIntegrity() {
  const configs = config;
  if (!configs.useEncryptationAES_RSA) {
    configs.useEncryptationAES_RSA = true;
  }
}
