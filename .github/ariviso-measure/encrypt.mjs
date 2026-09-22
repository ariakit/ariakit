import {
  constants,
  createCipheriv,
  createDecipheriv,
  createPrivateKey,
  createPublicKey,
  privateDecrypt,
  publicEncrypt,
  randomBytes,
} from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdtempDisposable, open, rename } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

const magic = Buffer.from("ARIVISO1");
const prefixBytes = magic.length + 4;
const maximumHeaderBytes = 2_048;
const keyBytes = 32;
const ivBytes = 12;
const tagBytes = 16;
const rsaBits = 3_072;

function validateRsaKey(key) {
  if (
    key.asymmetricKeyType !== "rsa" ||
    key.asymmetricKeyDetails?.modulusLength !== rsaBits
  ) {
    throw new Error("Evidence encryption requires an RSA-3072 key");
  }
}

function decodeBase64(value, expectedBytes) {
  if (typeof value !== "string") {
    throw new Error("Invalid evidence encryption header");
  }
  const decoded = Buffer.from(value, "base64");
  if (
    decoded.length !== expectedBytes ||
    decoded.toString("base64") !== value
  ) {
    throw new Error("Invalid evidence encryption header");
  }
  return decoded;
}

function parseHeader(bytes) {
  const requiredFields = ["version", "cipher", "wrap", "iv", "wrappedKey"];
  let header;
  try {
    header = JSON.parse(bytes.toString("utf8"));
  } catch {
    throw new Error("Invalid evidence encryption header");
  }
  if (
    !header ||
    typeof header !== "object" ||
    Array.isArray(header) ||
    Object.keys(header).length !== requiredFields.length ||
    !requiredFields.every((field) => Object.hasOwn(header, field)) ||
    header.version !== 1 ||
    header.cipher !== "aes-256-gcm" ||
    header.wrap !== "rsa-oaep-sha256"
  ) {
    throw new Error("Unsupported evidence encryption header");
  }
  return {
    iv: decodeBase64(header.iv, ivBytes),
    wrappedKey: decodeBase64(header.wrappedKey, rsaBits / 8),
  };
}

async function readExact(input, length, position) {
  const bytes = Buffer.alloc(length);
  let offset = 0;
  while (offset < length) {
    const { bytesRead } = await input.read(
      bytes,
      offset,
      length - offset,
      position + offset,
    );
    if (bytesRead === 0) {
      throw new Error("Truncated encrypted evidence");
    }
    offset += bytesRead;
  }
  return bytes;
}

async function publishOutput(outputPath, write) {
  await using directory = await mkdtempDisposable(
    path.join(path.dirname(path.resolve(outputPath)), ".ariviso-evidence-"),
  );
  const temporaryPath = path.join(directory.path, "output");
  await write(temporaryPath);
  await rename(temporaryPath, outputPath);
}

async function* frameCiphertext(source, { authenticatedHeader, cipher }) {
  yield authenticatedHeader;
  for await (const chunk of source) {
    yield chunk;
  }
  yield cipher.getAuthTag();
}

/** Encrypts file bytes without loading the payload into memory. */
export async function encryptFile(inputPath, outputPath, publicKeyPEM) {
  const publicKey = createPublicKey(publicKeyPEM);
  validateRsaKey(publicKey);
  const key = randomBytes(keyBytes);
  try {
    const iv = randomBytes(ivBytes);
    const wrappedKey = publicEncrypt(
      {
        key: publicKey,
        padding: constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      key,
    );
    const header = Buffer.from(
      JSON.stringify({
        version: 1,
        cipher: "aes-256-gcm",
        wrap: "rsa-oaep-sha256",
        iv: iv.toString("base64"),
        wrappedKey: wrappedKey.toString("base64"),
      }),
    );
    const prefix = Buffer.alloc(prefixBytes);
    magic.copy(prefix);
    prefix.writeUInt32BE(header.length, magic.length);
    const authenticatedHeader = Buffer.concat([prefix, header]);
    const cipher = createCipheriv("aes-256-gcm", key, iv, {
      authTagLength: tagBytes,
    });
    // Authenticate the original framing bytes as well as the JSON metadata.
    cipher.setAAD(authenticatedHeader);
    await publishOutput(outputPath, (temporaryPath) =>
      pipeline(
        createReadStream(inputPath),
        cipher,
        (source) => frameCiphertext(source, { authenticatedHeader, cipher }),
        createWriteStream(temporaryPath, { flags: "wx", mode: 0o600 }),
      ),
    );
  } finally {
    key.fill(0);
  }
}

/**
 * Publishes plaintext only after authentication; failures preserve the target.
 */
export async function decryptFile(inputPath, outputPath, privateKeyPEM) {
  const privateKey = createPrivateKey(privateKeyPEM);
  validateRsaKey(privateKey);
  await using input = await open(inputPath, "r");
  const { size } = await input.stat();
  const prefix = await readExact(input, prefixBytes, 0);
  if (!prefix.subarray(0, magic.length).equals(magic)) {
    throw new Error("Invalid encrypted evidence format");
  }
  const headerLength = prefix.readUInt32BE(magic.length);
  if (headerLength === 0 || headerLength > maximumHeaderBytes) {
    throw new Error("Invalid evidence encryption header length");
  }
  const ciphertextStart = prefixBytes + headerLength;
  const ciphertextBytes = size - ciphertextStart - tagBytes;
  if (ciphertextBytes < 0) {
    throw new Error("Truncated encrypted evidence");
  }
  const header = await readExact(input, headerLength, prefixBytes);
  const { iv, wrappedKey } = parseHeader(header);
  const key = privateDecrypt(
    {
      key: privateKey,
      padding: constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    wrappedKey,
  );
  try {
    if (key.length !== keyBytes) {
      throw new Error("Invalid evidence encryption key");
    }
    const decipher = createDecipheriv("aes-256-gcm", key, iv, {
      authTagLength: tagBytes,
    });
    decipher.setAAD(Buffer.concat([prefix, header]));
    decipher.setAuthTag(await readExact(input, tagBytes, size - tagBytes));
    // GCM can emit plaintext before the final tag check, so keep it private.
    await publishOutput(outputPath, (temporaryPath) =>
      pipeline(
        ciphertextBytes === 0
          ? Readable.from([])
          : input.createReadStream({
              start: ciphertextStart,
              end: size - tagBytes - 1,
              autoClose: false,
            }),
        decipher,
        createWriteStream(temporaryPath, { flags: "wx", mode: 0o600 }),
      ),
    );
  } finally {
    key.fill(0);
  }
}
