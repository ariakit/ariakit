import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { sha256 } from "../ariviso/identity.mjs";
import { summarize, comparePasses } from "./measure.mjs";
import Reporter from "./reporter.mjs";

const require = createRequire(
  new URL("../ariviso/package.json", import.meta.url),
);
const { PNG } = require("pngjs");

function attempt({
  retry = 0,
  status = "passed",
  red = 0,
  omitImage = false,
} = {}) {
  const png = new PNG({ width: 2, height: 1 });
  png.data.set([red, 0, 0, 255, 0, 0, 0, 255]);
  const bytes = PNG.sync.write(png);
  const payload = {
    attemptToken: `attempt-${retry}`,
    ordinal: 0,
    imageAttachment: "image",
    capture: {
      itemKey: "private-item",
      variant: { key: "chromium/react" },
      testId: "private-test",
      testRetry: retry,
      profileDigest: "a".repeat(64),
    },
    profile: { digest: "a".repeat(64), profile: {} },
    image: { digest: sha256(bytes), bytes: bytes.length, width: 2, height: 1 },
  };
  const attachments = [
    {
      name: "start",
      contentType: "application/vnd.ariviso.capture-started+json",
      body: Buffer.from(JSON.stringify({ attemptToken: payload.attemptToken })),
    },
    {
      name: "metadata",
      contentType: "application/vnd.ariviso.capture+json",
      body: Buffer.from(JSON.stringify(payload)),
    },
  ];
  if (!omitImage) {
    attachments.push({ name: "image", contentType: "image/png", body: bytes });
  }
  return {
    retry,
    status,
    errors: status === "passed" ? [] : [{ message: "private failure" }],
    duration: 10,
    attachments,
  };
}

async function record(directory, attempts, status = "passed") {
  const reporter = new Reporter({ output: directory });
  reporter.onBegin(
    {},
    {
      allTests: () => [
        {
          id: "private-test",
          titlePath: () => ["Private title"],
          location: { file: "/private/source.ts" },
          expectedStatus: "passed",
          results: attempts,
        },
      ],
    },
  );
  const outcome = await reporter.onEnd({ status });
  const report = JSON.parse(
    await readFile(path.join(directory, "captures.json"), "utf8"),
  );
  return { report, outcome };
}

test("preserves every retry record and selects only the final successful image", async () => {
  const directory = await mkdtemp(
    path.join(os.tmpdir(), "ariviso-measure-test-"),
  );
  try {
    const { report, outcome } = await record(directory, [
      attempt({ status: "failed", red: 200 }),
      attempt({ retry: 1, red: 1 }),
    ]);
    assert.equal(outcome, undefined);
    assert.equal(report.complete, true);
    const [testResult] = report.tests;
    const [capture] = report.captures;
    assert.ok(testResult);
    assert.ok(capture);
    assert.equal(testResult.attempts.length, 2);
    assert.equal(report.captures.length, 1);
    assert.equal(capture.capture.testRetry, 1);
    const image = PNG.sync.read(
      await readFile(path.join(directory, capture.path)),
    );
    assert.equal(image.data[0], 1);
    const metrics = summarize(report);
    assert.equal(metrics.recoveredTests, 1);
    assert.equal(metrics.failedAttempts, 1);
    assert.equal(metrics.bytes, capture.image.bytes);
    assert.doesNotMatch(JSON.stringify(metrics), /private|Private|source\.ts/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("a final failure or a missing successful image cannot produce a complete report", async () => {
  const directory = await mkdtemp(
    path.join(os.tmpdir(), "ariviso-measure-fail-"),
  );
  try {
    for (const [name, attempts, status] of [
      [
        "failure",
        [attempt(), attempt({ retry: 1, status: "failed" })],
        "failed",
      ],
      ["missing", [attempt({ omitImage: true })], "passed"],
    ]) {
      const { report, outcome } = await record(
        path.join(directory, name),
        attempts,
        status,
      );
      assert.equal(report.complete, false);
      assert.deepEqual(outcome, { status: "failed" });
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("measures exact RGBA differences and rejects inventory/profile equivalence assumptions", async () => {
  const directory = await mkdtemp(
    path.join(os.tmpdir(), "ariviso-measure-pairs-"),
  );
  try {
    const first = path.join(directory, "first");
    const second = path.join(directory, "second");
    await record(first, [attempt({ red: 1 })]);
    await record(second, [attempt({ red: 2 })]);
    const changed = await comparePasses(first, second);
    assert.equal(changed.summary.changedPixels, 1);
    assert.equal(changed.summary.pixelsChanged, 1);
    assert.equal(changed.summary.inventoryEqual, true);
    assert.equal((await comparePasses(first, first)).summary.equal, 1);
    const file = path.join(second, "captures.json");
    const report = JSON.parse(await readFile(file, "utf8"));
    const [capture] = report.captures;
    const [testResult] = report.tests;
    assert.ok(capture);
    assert.ok(testResult);
    capture.capture.profileDigest = "b".repeat(64);
    testResult.id = "another-test";
    await writeFile(file, JSON.stringify(report));
    const incompatible = await comparePasses(first, second);
    assert.equal(incompatible.summary.inventoryEqual, false);
    assert.equal(incompatible.summary.profileChanged, 1);
    assert.equal(incompatible.summary.changedPixels, 0);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("the public workflow cannot request identity tokens or upload raw capture paths", async () => {
  const workflow = await readFile(
    new URL("../workflows/ariviso-measure.yml", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(
    workflow,
    /id-token:|secrets: inherit|ARIVISO_CLI|context\.mjs|ariviso (upload|finalize)/,
  );
  const artifact = workflow.slice(
    workflow.indexOf("- name: Preserve encrypted evidence"),
  );
  assert.match(artifact, /\/public\/evidence\.enc/);
  assert.match(artifact, /\/public\/summary\.json/);
  assert.doesNotMatch(artifact, /\/private|\.zip|\.png|environment.*json/);
});
