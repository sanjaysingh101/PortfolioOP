const crypto = require("crypto");
const fs = require("fs");

const encryptFile = (inputFile, outputFile, password) => {
  const key = crypto.createHash("sha256").update(password).digest();
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  const input = fs.createReadStream(inputFile);
  const output = fs.createWriteStream(outputFile);
  console.log("Encryption done")
  output.write(iv);
  input.pipe(cipher).pipe(output);
};

encryptFile("PortfolioCharacter.glb", "PortfolioCharacter.enc", "qwerty123");
