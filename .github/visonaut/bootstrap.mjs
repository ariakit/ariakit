import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const settings = JSON.parse(
  await readFile(new URL("settings.json", import.meta.url), "utf8"),
);
const directory = process.env.VISONAUT_PACKAGE_DIRECTORY;
if (!directory || !path.isAbsolute(directory)) {
  throw new Error("Set an absolute package artifact directory");
}
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

async function verify(name, bytes) {
  const pin = settings.packages?.[name];
  if (
    !/^[a-f0-9]{64}$/.test(pin?.sha256) ||
    !Number.isSafeInteger(pin?.bytes) ||
    pin.bytes < 1 ||
    pin.bytes > 10 * 1024 * 1024 ||
    bytes.length !== pin.bytes ||
    sha256(bytes) !== pin.sha256
  ) {
    throw new Error(`The ${name} package differs from its reviewed pin`);
  }
}

if (process.argv[2] === "download") {
  const stage = process.argv[3];
  if (stage !== "render" && stage !== "capture") {
    throw new Error("Choose the signed render or capture job");
  }
  const browser = process.env.VISONAUT_BROWSER;
  if (!new Set(["chromium", "firefox", "webkit"]).has(browser)) {
    throw new Error("Unknown Visonaut browser shard");
  }
  const server = new URL(settings.server);
  if (server.protocol !== "https:") {
    throw new Error("The Visonaut server must use HTTPS");
  }
  const requestUrl = process.env.ACTIONS_ID_TOKEN_REQUEST_URL;
  const requestToken = process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN;
  if (!requestUrl || !requestToken) {
    throw new Error("GitHub OIDC is unavailable for this job");
  }
  const tokenUrl = new URL(requestUrl);
  tokenUrl.searchParams.set("audience", new URL("/bootstrap", server).href);
  const tokenResponse = await fetch(tokenUrl, {
    headers: {
      Authorization: `Bearer ${requestToken}`,
    },
    redirect: "error",
    signal: AbortSignal.timeout(30_000),
  });
  if (!tokenResponse.ok)
    throw new Error("The signed CI identity is unavailable");
  const token = (await tokenResponse.json()).value;
  if (typeof token !== "string" || !token) {
    throw new Error("The signed CI identity is invalid");
  }
  const body = JSON.stringify({
    browser,
    stage,
    workflowRunId: process.env.GITHUB_RUN_ID,
    workflowAttempt: Number(process.env.GITHUB_RUN_ATTEMPT),
    testedSha: process.env.GITHUB_SHA,
  });
  await mkdir(directory, { recursive: true });
  for (const name of ["playwright", "cli"]) {
    const response = await fetch(
      new URL(`/v1/bootstrap/packages/${name}`, server),
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body,
        redirect: "error",
        signal: AbortSignal.timeout(30_000),
      },
    );
    if (!response.ok || !response.body)
      throw new Error(`The ${name} download failed`);
    const chunks = [];
    let size = 0;
    for await (const chunk of response.body) {
      size += chunk.length;
      if (size > 10 * 1024 * 1024)
        throw new Error(`The ${name} download is too large`);
      chunks.push(chunk);
    }
    const bytes = Buffer.concat(chunks, size);
    await verify(name, bytes);
    await writeFile(path.join(directory, `${name}.tgz`), bytes, {
      flag: "wx",
      mode: 0o600,
    });
  }
} else if (process.argv[2] === "install") {
  for (const [name, packageName] of [
    ["playwright", "@visonaut/playwright"],
    ["cli", "visonaut"],
  ]) {
    const archive = path.join(directory, `${name}.tgz`);
    await verify(name, await readFile(archive));
    const target = path.join(import.meta.dirname, "node_modules", packageName);
    await mkdir(path.dirname(target), { recursive: true });
    await mkdir(target);
    // The exact archive passed the public package audit before upload.
    const result = spawnSync(
      "tar",
      ["-xzf", archive, "-C", target, "--strip-components=1"],
      { stdio: "inherit" },
    );
    if (result.error) throw result.error;
    if (result.status !== 0)
      throw new Error(`Pinned ${name} package unpack failed: ${result.status}`);
  }
} else {
  throw new Error("Use bootstrap.mjs download or install");
}
