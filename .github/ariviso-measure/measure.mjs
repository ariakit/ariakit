import { spawnSync } from "node:child_process";
import { closeSync, openSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { projects, sha256 } from "../ariviso/identity.mjs";
import { encryptFile } from "./encrypt.mjs";

const executor = path.resolve(import.meta.dirname, "../ariviso");

export function summarize(report) {
  return {
    complete: report.complete === true,
    tests: report.tests.length,
    failedTests: report.tests.filter(
      (test) => test.attempts.at(-1)?.status !== "passed",
    ).length,
    recoveredTests: report.tests.filter(
      (test) =>
        test.attempts.length > 1 && test.attempts.at(-1)?.status === "passed",
    ).length,
    failedAttempts: report.tests
      .flatMap((test) => test.attempts)
      .filter((attempt) => attempt.status !== "passed").length,
    captures: report.captures.length,
    bytes: report.captures.reduce(
      (sum, capture) => sum + capture.image.bytes,
      0,
    ),
    pixels: report.captures.reduce(
      (sum, capture) => sum + capture.image.width * capture.image.height,
      0,
    ),
    maximumPixels: Math.max(
      0,
      ...report.captures.map(
        (capture) => capture.image.width * capture.image.height,
      ),
    ),
  };
}

export async function comparePasses(leftDirectory, rightDirectory) {
  const require = createRequire(path.join(executor, "package.json"));
  const { PNG } = require("pngjs");
  const left = JSON.parse(
    await readFile(path.join(leftDirectory, "captures.json"), "utf8"),
  );
  const right = JSON.parse(
    await readFile(path.join(rightDirectory, "captures.json"), "utf8"),
  );
  const key = (capture) =>
    JSON.stringify([capture.capture.itemKey, capture.capture.variant.key]);
  const prior = new Map(
    left.captures.map((capture) => [key(capture), capture]),
  );
  const details = [];
  for (const capture of right.captures) {
    const identity = key(capture);
    const before = prior.get(identity);
    prior.delete(identity);
    if (!before) {
      details.push({ identity, result: "added" });
      continue;
    }
    if (before.capture.profileDigest !== capture.capture.profileDigest) {
      details.push({ identity, result: "profile-changed" });
      continue;
    }
    const original = PNG.sync.read(
      await readFile(path.join(leftDirectory, before.path)),
      { checkCRC: true },
    );
    const candidate = PNG.sync.read(
      await readFile(path.join(rightDirectory, capture.path)),
      { checkCRC: true },
    );
    if (
      original.width !== candidate.width ||
      original.height !== candidate.height
    ) {
      details.push({ identity, result: "size-changed" });
      continue;
    }
    let changedPixels = 0;
    for (let index = 0; index < original.data.length; index += 4) {
      if (
        original.data[index] !== candidate.data[index] ||
        original.data[index + 1] !== candidate.data[index + 1] ||
        original.data[index + 2] !== candidate.data[index + 2] ||
        original.data[index + 3] !== candidate.data[index + 3]
      ) {
        changedPixels++;
      }
    }
    details.push({
      identity,
      result: changedPixels ? "pixels-changed" : "equal",
      changedPixels,
      totalPixels: original.width * original.height,
      originalDigest: before.image.digest,
      candidateDigest: capture.image.digest,
    });
  }
  for (const identity of prior.keys()) {
    details.push({ identity, result: "removed" });
  }
  const summary = {
    inventoryEqual:
      JSON.stringify(left.tests.map((test) => test.id).sort()) ===
      JSON.stringify(right.tests.map((test) => test.id).sort()),
    compared: details.length,
    equal: 0,
    added: 0,
    removed: 0,
    profileChanged: 0,
    sizeChanged: 0,
    pixelsChanged: 0,
    changedPixels: 0,
  };
  const counters = {
    equal: "equal",
    added: "added",
    removed: "removed",
    "profile-changed": "profileChanged",
    "size-changed": "sizeChanged",
    "pixels-changed": "pixelsChanged",
  };
  for (const detail of details) {
    summary[counters[detail.result]]++;
    summary.changedPixels += detail.changedPixels ?? 0;
  }
  return { summary, details };
}

function runLogged({ command, args, log, env }) {
  const descriptor = openSync(log, "w", 0o600);
  try {
    const result = spawnSync(command, args, {
      env,
      stdio: ["ignore", descriptor, descriptor],
      timeout: 35 * 60 * 1000,
    });
    return {
      exitCode: result.status,
      signal: result.signal,
      error: result.error?.message,
    };
  } finally {
    closeSync(descriptor);
  }
}

async function main() {
  if (process.env.CI !== "true" || process.env.GITHUB_ACTIONS !== "true") {
    throw new Error("Measurements run only in GitHub Actions");
  }
  const browser = process.env.ARIVISO_BROWSER;
  if (!Object.hasOwn(projects, browser)) {
    throw new Error("Unknown measurement browser");
  }
  const directory = path.join(
    process.env.RUNNER_TEMP,
    `ariviso-evidence-${browser}`,
  );
  const raw = path.join(directory, "private");
  const output = path.join(directory, "public");
  await mkdir(raw, { recursive: true, mode: 0o700 });
  await mkdir(output, { recursive: true });
  const summary = {
    schemaVersion: 1,
    authority: "capture-only measurement; no OIDC or service upload",
    comparator: "decoded RGBA exact equality; not the service comparator",
    browser,
    testedSha: process.env.GITHUB_SHA,
    workflowRunId: process.env.GITHUB_RUN_ID,
    workflowAttempt: Number(process.env.GITHUB_RUN_ATTEMPT),
    passes: [],
    comparisons: [],
    complete: false,
  };
  try {
    const source = {};
    for (const file of [
      "measure.mjs",
      "playwright.config.mjs",
      "reporter.mjs",
      "encrypt.mjs",
      "public-key.pem",
    ]) {
      source[file] = sha256(
        await readFile(path.join(import.meta.dirname, file)),
      );
    }
    source.executorLock = sha256(
      await readFile(path.join(executor, "package-lock.json")),
    );
    const settings = JSON.parse(
      await readFile(path.join(executor, "settings.json"), "utf8"),
    );
    summary.adapterSha256 = settings.packages.playwright.sha256;
    await writeFile(
      path.join(raw, "source.json"),
      JSON.stringify({ ...summary, node: process.version, source }, null, 2),
    );
    const environmentResult = runLogged({
      command: process.execPath,
      args: [path.join(executor, "environment.mjs")],
      log: path.join(raw, "environment.log"),
      env: process.env,
    });
    if (environmentResult.exitCode !== 0) {
      throw new Error("Runner environment measurement failed");
    }
    const environmentBytes = await readFile(
      path.join(
        process.env.GITHUB_WORKSPACE,
        `app/.ariviso-results/environment-${browser}.json`,
      ),
    );
    await writeFile(path.join(raw, "environment.json"), environmentBytes);
    summary.environmentSha256 = sha256(environmentBytes);
    for (let iteration = 1; iteration <= 3; iteration++) {
      const pass = path.join(raw, `pass-${iteration}`);
      await mkdir(pass);
      const started = performance.now();
      const args = [
        path.join(executor, "node_modules/playwright/cli.js"),
        "test",
        "--config",
        path.join(import.meta.dirname, "playwright.config.mjs"),
      ];
      const result = runLogged({
        command: process.platform === "linux" ? "xvfb-run" : process.execPath,
        args:
          process.platform === "linux"
            ? ["-a", process.execPath, ...args]
            : args,
        log: path.join(pass, "execution.log"),
        env: { ...process.env, ARIVISO_MEASUREMENT_OUTPUT: pass },
      });
      await writeFile(path.join(pass, "process.json"), JSON.stringify(result));
      let metrics = { complete: false };
      try {
        metrics = summarize(
          JSON.parse(await readFile(path.join(pass, "captures.json"), "utf8")),
        );
      } catch {
        // Preserve the failed process output even if Playwright could not
        // report.
      }
      summary.passes.push({
        iteration,
        exitCode: result.exitCode,
        elapsedMs: Math.round(performance.now() - started),
        ...metrics,
      });
    }
    summary.complete =
      summary.passes.length === 3 &&
      summary.passes.every((pass) => pass.exitCode === 0 && pass.complete);
    if (summary.complete) {
      for (const [left, right] of [
        [1, 2],
        [2, 3],
        [1, 3],
      ]) {
        const comparison = await comparePasses(
          path.join(raw, `pass-${left}`),
          path.join(raw, `pass-${right}`),
        );
        await writeFile(
          path.join(raw, `comparison-${left}-${right}.json`),
          JSON.stringify(comparison, null, 2),
        );
        summary.comparisons.push({ left, right, ...comparison.summary });
      }
      summary.complete = summary.comparisons.every(
        (comparison) =>
          comparison.inventoryEqual &&
          comparison.added === 0 &&
          comparison.removed === 0,
      );
    }
  } catch (error) {
    summary.complete = false;
    await writeFile(path.join(raw, "error.txt"), String(error));
  }
  await writeFile(
    path.join(raw, "summary.json"),
    JSON.stringify(summary, null, 2),
  );
  const archive = path.join(directory, "private.tar.gz");
  const packed = spawnSync("tar", ["-czf", archive, "-C", raw, "."], {
    stdio: "pipe",
    timeout: 10 * 60 * 1000,
  });
  if (packed.error || packed.status !== 0) {
    throw new Error("Private evidence packing failed");
  }
  await encryptFile(
    archive,
    path.join(output, "evidence.enc"),
    await readFile(path.join(import.meta.dirname, "public-key.pem"), "utf8"),
  );
  await writeFile(
    path.join(output, "summary.json"),
    JSON.stringify(summary, null, 2),
  );
  console.log(JSON.stringify(summary));
  if (!summary.complete) {
    process.exitCode = 1;
  }
}

if (import.meta.main) {
  try {
    await main();
  } catch {
    console.error(
      "Capture measurement failed. No unencrypted evidence was published.",
    );
    process.exitCode = 1;
  }
}
