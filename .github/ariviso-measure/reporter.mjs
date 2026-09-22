import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { sha256 } from "../ariviso/identity.mjs";

async function attachmentBytes(attachment) {
  if (attachment.body) {
    return attachment.body;
  }
  if (attachment.path) {
    return readFile(attachment.path);
  }
  throw new Error("Missing capture attachment bytes");
}

/**
 * This report measures captures and has no service authorization or receipt.
 */
export default class MeasurementReporter {
  constructor({ output }) {
    this.output = output;
    this.errors = [];
  }

  onBegin(_config, suite) {
    this.tests = suite.allTests();
  }

  onError(error) {
    this.errors.push(error);
  }

  async onEnd(result) {
    const tests = this.tests ?? [];
    const captures = [];
    const identities = new Set();
    await mkdir(path.join(this.output, "images"), { recursive: true });
    const inventory = tests.map((test) => ({
      id: test.id,
      title: test.titlePath(),
      file: test.location.file,
      expectedStatus: test.expectedStatus,
      attempts: test.results.map((attempt) => ({
        retry: attempt.retry,
        status: attempt.status,
        duration: attempt.duration,
        errors: attempt.errors,
      })),
    }));
    try {
      for (const test of tests) {
        const final = test.results.at(-1);
        if (
          !final ||
          final.status !== "passed" ||
          test.expectedStatus !== "passed" ||
          final.errors.length
        )
          continue;
        const metadata = final.attachments.filter(
          (attachment) =>
            attachment.contentType === "application/vnd.ariviso.capture+json",
        );
        const starts = final.attachments.filter(
          (attachment) =>
            attachment.contentType ===
            "application/vnd.ariviso.capture-started+json",
        );
        const tokens = new Set();
        for (const start of starts) {
          const { attemptToken } = JSON.parse(await attachmentBytes(start));
          if (typeof attemptToken !== "string" || tokens.has(attemptToken)) {
            throw new Error("Invalid capture start marker");
          }
          tokens.add(attemptToken);
        }
        if (tokens.size !== metadata.length) {
          throw new Error("A started capture did not finish");
        }
        let ordinal = 0;
        for (const attachment of metadata) {
          const payload = JSON.parse(await attachmentBytes(attachment));
          const identity = JSON.stringify([
            payload.capture.itemKey,
            payload.capture.variant.key,
          ]);
          if (
            !tokens.delete(payload.attemptToken) ||
            payload.ordinal !== ordinal++ ||
            identities.has(identity) ||
            payload.capture.testId !== test.id ||
            payload.capture.testRetry !== final.retry
          ) {
            throw new Error("Invalid or duplicate final capture identity");
          }
          identities.add(identity);
          const matches = final.attachments.filter(
            (candidate) =>
              candidate.name === payload.imageAttachment &&
              candidate.contentType === "image/png",
          );
          const image = matches[0];
          if (matches.length !== 1 || !image) {
            throw new Error("Capture image is missing or ambiguous");
          }
          const bytes = await attachmentBytes(image);
          if (
            sha256(bytes) !== payload.image.digest ||
            bytes.length !== payload.image.bytes
          ) {
            throw new Error("Capture bytes do not match their metadata");
          }
          const imagePath = `images/${payload.image.digest}.png`;
          await writeFile(path.join(this.output, imagePath), bytes);
          captures.push({ ...payload, path: imagePath });
        }
      }
    } catch (error) {
      this.errors.push({ message: String(error) });
    }
    const complete =
      result.status === "passed" &&
      tests.length > 0 &&
      captures.length > 0 &&
      this.errors.length === 0 &&
      tests.every(
        (test) =>
          test.expectedStatus === "passed" &&
          test.results.at(-1)?.status === "passed" &&
          test.results.at(-1)?.errors.length === 0,
      );
    await writeFile(
      path.join(this.output, "captures.json"),
      JSON.stringify(
        {
          schemaVersion: 1,
          authority: "measurement-only",
          complete,
          result,
          errors: this.errors,
          tests: inventory,
          captures,
        },
        null,
        2,
      ),
    );
    if (!complete) {
      return { status: "failed" };
    }
  }
}
