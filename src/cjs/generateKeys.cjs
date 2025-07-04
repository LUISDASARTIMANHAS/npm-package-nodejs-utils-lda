const { generateKeyPairSync } = require("crypto");
const fs = require("fs");
const path = require("path");
const config = fopen("config.json");

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
  const configs = fopen("config.json");

  if (!configs.useEncryptationAES_RSA) {
    configs.useEncryptationAES_RSA = true;
  }
}
