import assert from "node:assert/strict";
import {
  constants,
  createDecipheriv,
  createHash,
  generateKeyPairSync,
  privateDecrypt,
  randomBytes,
} from "node:crypto";
import { createReadStream } from "node:fs";
import {
  mkdtempDisposable,
  open,
  readFile,
  readdir,
  stat,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { decryptFile, encryptFile } from "./encrypt.mjs";

const keys = generateKeyPairSync("rsa", {
  modulusLength: 3_072,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

async function createFixture(directory, bytes = randomBytes(256 * 1_024)) {
  const input = path.join(directory, "input.tar.gz");
  const encrypted = path.join(directory, "encrypted.bin");
  const decrypted = path.join(directory, "decrypted.tar.gz");
  await writeFile(input, bytes);
  await encryptFile(input, encrypted, keys.publicKey);
  return { input, encrypted, decrypted, bytes };
}

async function assertRejected(
  fixture,
  { privateKey = keys.privateKey, error } = {},
) {
  const directory = path.dirname(fixture.decrypted);
  const before = await readdir(directory);
  await assert.rejects(
    decryptFile(fixture.encrypted, fixture.decrypted, privateKey),
    error,
  );
  await assert.rejects(stat(fixture.decrypted), { code: "ENOENT" });
  assert.deepEqual(await readdir(directory), before);
}

function replaceHeader(encrypted, transform) {
  const originalLength = encrypted.readUInt32BE(8);
  const header = Buffer.from(
    transform(encrypted.subarray(12, 12 + originalLength).toString("utf8")),
  );
  const prefix = Buffer.from(encrypted.subarray(0, 12));
  prefix.writeUInt32BE(header.length, 8);
  return Buffer.concat([
    prefix,
    header,
    encrypted.subarray(12 + originalLength),
  ]);
}

async function hashFile(input) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(input)) {
    hash.update(chunk);
  }
  return hash.digest("hex");
}

test("encrypts exact binary bytes in an interoperable authenticated envelope", async () => {
  await using directory = await mkdtempDisposable(
    path.join(tmpdir(), "ariviso-encryption-test-"),
  );
  const bytes = Buffer.concat([
    Buffer.from([0x00, 0xff, 0xc0, 0x80, 0x0a, 0x0d]),
    randomBytes(256 * 1_024),
  ]);
  const fixture = await createFixture(directory.path, bytes);
  const encrypted = await readFile(fixture.encrypted);
  assert.equal(encrypted.subarray(0, 8).toString(), "ARIVISO1");
  const headerLength = encrypted.readUInt32BE(8);
  assert.ok(headerLength > 0 && headerLength <= 2_048);
  const headerEnd = 12 + headerLength;
  const header = JSON.parse(encrypted.subarray(12, headerEnd).toString());
  assert.deepEqual(Object.keys(header).sort(), [
    "cipher",
    "iv",
    "version",
    "wrap",
    "wrappedKey",
  ]);
  assert.equal(header.version, 1);
  assert.equal(header.cipher, "aes-256-gcm");
  assert.equal(header.wrap, "rsa-oaep-sha256");
  assert.equal(Buffer.from(header.iv, "base64").length, 12);
  assert.equal(Buffer.from(header.wrappedKey, "base64").length, 384);

  // Decode the raw envelope independently so matching inverse bugs cannot pass.
  const key = privateDecrypt(
    {
      key: keys.privateKey,
      padding: constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    Buffer.from(header.wrappedKey, "base64"),
  );
  const decipher = createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(header.iv, "base64"),
    { authTagLength: 16 },
  );
  decipher.setAAD(encrypted.subarray(0, headerEnd));
  decipher.setAuthTag(encrypted.subarray(-16));
  assert.deepEqual(
    Buffer.concat([
      decipher.update(encrypted.subarray(headerEnd, -16)),
      decipher.final(),
    ]),
    bytes,
  );
  await decryptFile(fixture.encrypted, fixture.decrypted, keys.privateKey);
  assert.deepEqual(await readFile(fixture.decrypted), bytes);
  assert.equal((await stat(fixture.decrypted)).mode & 0o777, 0o600);
});

test("encrypts empty files and generates fresh keys and IVs", async () => {
  await using directory = await mkdtempDisposable(
    path.join(tmpdir(), "ariviso-encryption-test-"),
  );
  const fixture = await createFixture(directory.path, Buffer.alloc(0));
  const first = await readFile(fixture.encrypted);
  await encryptFile(fixture.input, fixture.encrypted, keys.publicKey);
  const second = await readFile(fixture.encrypted);
  const firstHeader = JSON.parse(
    first.subarray(12, 12 + first.readUInt32BE(8)).toString(),
  );
  const secondHeader = JSON.parse(
    second.subarray(12, 12 + second.readUInt32BE(8)).toString(),
  );
  assert.notEqual(firstHeader.iv, secondHeader.iv);
  const unwrap = (header) =>
    privateDecrypt(
      {
        key: keys.privateKey,
        padding: constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      Buffer.from(header.wrappedKey, "base64"),
    );
  assert.notDeepEqual(unwrap(firstHeader), unwrap(secondHeader));
  await decryptFile(fixture.encrypted, fixture.decrypted, keys.privateKey);
  assert.deepEqual(await readFile(fixture.decrypted), Buffer.alloc(0));
});

test("rejects altered ciphertext and tags without publishing plaintext", async () => {
  await using directory = await mkdtempDisposable(
    path.join(tmpdir(), "ariviso-encryption-test-"),
  );
  const fixture = await createFixture(directory.path);
  const encrypted = await readFile(fixture.encrypted);
  for (const offset of [12 + encrypted.readUInt32BE(8), encrypted.length - 1]) {
    const altered = Buffer.from(encrypted);
    altered[offset] ^= 1;
    await writeFile(fixture.encrypted, altered);
    await assertRejected(fixture);
  }
});

test("authenticates original header bytes even when the metadata is unchanged", async () => {
  await using directory = await mkdtempDisposable(
    path.join(tmpdir(), "ariviso-encryption-test-"),
  );
  const fixture = await createFixture(directory.path);
  const encrypted = await readFile(fixture.encrypted);
  await writeFile(
    fixture.encrypted,
    replaceHeader(encrypted, (header) => ` ${header}`),
  );
  await assertRejected(fixture);
});

test("rejects unsupported algorithms, versions, and malformed header fields", async () => {
  await using directory = await mkdtempDisposable(
    path.join(tmpdir(), "ariviso-encryption-test-"),
  );
  const fixture = await createFixture(directory.path);
  const encrypted = await readFile(fixture.encrypted);
  const invalidHeaders = [
    "null",
    "[]",
    "{",
    { version: 2 },
    { cipher: "aes-256-cbc" },
    { wrap: "rsa-oaep-sha1" },
    { iv: "not base64" },
    { iv: `${Buffer.alloc(12).toString("base64")}\n` },
    { wrappedKey: Buffer.alloc(32).toString("base64") },
    { extra: true },
  ];
  for (const invalidHeader of invalidHeaders) {
    const altered = replaceHeader(encrypted, (header) =>
      typeof invalidHeader === "string"
        ? invalidHeader
        : JSON.stringify({ ...JSON.parse(header), ...invalidHeader }),
    );
    await writeFile(fixture.encrypted, altered);
    await assertRejected(fixture, { error: /evidence encryption header/ });
  }
});

test("rejects oversized headers, bad framing, and truncated input", async () => {
  await using directory = await mkdtempDisposable(
    path.join(tmpdir(), "ariviso-encryption-test-"),
  );
  const fixture = await createFixture(directory.path);
  const encrypted = await readFile(fixture.encrypted);
  for (const length of [0, 2_049, 0xffff_ffff]) {
    const altered = Buffer.from(encrypted);
    altered.writeUInt32BE(length, 8);
    await writeFile(fixture.encrypted, altered);
    await assertRejected(fixture, { error: /header length/ });
  }
  const badMagic = Buffer.from(encrypted);
  badMagic[0] = 0;
  await writeFile(fixture.encrypted, badMagic);
  await assertRejected(fixture);
  for (const length of [
    0,
    8,
    12,
    20,
    encrypted.length - 16,
    encrypted.length - 1,
  ]) {
    await writeFile(fixture.encrypted, encrypted.subarray(0, length));
    await assertRejected(fixture);
  }
});

test("rejects the wrong private key and preserves an existing destination", async () => {
  await using directory = await mkdtempDisposable(
    path.join(tmpdir(), "ariviso-encryption-test-"),
  );
  const fixture = await createFixture(directory.path);
  const wrongKeys = generateKeyPairSync("rsa", {
    modulusLength: 3_072,
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
  await assertRejected(fixture, { privateKey: wrongKeys.privateKey });
  const previous = Buffer.from("Previously authenticated evidence");
  await writeFile(fixture.decrypted, previous);
  const encrypted = await readFile(fixture.encrypted);
  encrypted[encrypted.length - 1] ^= 1;
  await writeFile(fixture.encrypted, encrypted);
  const before = await readdir(directory.path);
  await assert.rejects(
    decryptFile(fixture.encrypted, fixture.decrypted, keys.privateKey),
  );
  assert.deepEqual(await readFile(fixture.decrypted), previous);
  assert.deepEqual(await readdir(directory.path), before);
});

test("requires RSA-3072 and cleans up incomplete encryption", async () => {
  await using directory = await mkdtempDisposable(
    path.join(tmpdir(), "ariviso-encryption-test-"),
  );
  const input = path.join(directory.path, "missing.tar.gz");
  const output = path.join(directory.path, "encrypted.bin");
  const smallKeys = generateKeyPairSync("rsa", {
    modulusLength: 2_048,
    publicKeyEncoding: { type: "spki", format: "pem" },
  });
  await assert.rejects(
    encryptFile(input, output, smallKeys.publicKey),
    /RSA-3072/,
  );
  await assert.rejects(encryptFile(input, output, keys.publicKey), {
    code: "ENOENT",
  });
  assert.deepEqual(await readdir(directory.path), []);
});

test("streams a 32 MiB payload across file and cipher chunk boundaries", async () => {
  await using directory = await mkdtempDisposable(
    path.join(tmpdir(), "ariviso-encryption-test-"),
  );
  const input = path.join(directory.path, "large.tar.gz");
  const encrypted = path.join(directory.path, "encrypted.bin");
  const decrypted = path.join(directory.path, "decrypted.tar.gz");
  const chunk = randomBytes(256 * 1_024);
  {
    await using file = await open(input, "wx");
    for (let i = 0; i < 128; i += 1) {
      await file.writeFile(chunk);
    }
  }
  await encryptFile(input, encrypted, keys.publicKey);
  await decryptFile(encrypted, decrypted, keys.privateKey);
  assert.equal((await stat(decrypted)).size, 32 * 1_024 * 1_024);
  assert.equal(await hashFile(decrypted), await hashFile(input));
});
