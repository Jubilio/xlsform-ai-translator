import fs from "node:fs";
import path from "node:path";
import selfsigned from "selfsigned";

const certDirectory = path.resolve("certs");
const certPath = path.join(certDirectory, "localhost.crt");
const keyPath = path.join(certDirectory, "localhost.key");

fs.mkdirSync(certDirectory, { recursive: true });

if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
  console.log(`Certificado existente: ${certPath}`);
  process.exit(0);
}

const attributes = [{ name: "commonName", value: "localhost" }];
const generated = selfsigned.generate(attributes, {
  algorithm: "sha256",
  days: 825,
  keySize: 2048,
  extensions: [
    { name: "basicConstraints", cA: true },
    { name: "keyUsage", keyCertSign: true, digitalSignature: true, keyEncipherment: true },
    { name: "extKeyUsage", serverAuth: true, clientAuth: true },
    {
      name: "subjectAltName",
      altNames: [
        { type: 2, value: "localhost" },
        { type: 7, ip: "127.0.0.1" },
        { type: 7, ip: "::1" }
      ]
    }
  ]
});

fs.writeFileSync(certPath, generated.cert, { mode: 0o644 });
fs.writeFileSync(keyPath, generated.private, { mode: 0o600 });
console.log(`Certificado criado: ${certPath}`);
console.log("No Windows, execute: npm run trust:cert:windows");
