import { createHash } from "node:crypto";

export function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

// This is the protocol's canonical JSON encoding for trusted JSON records.
export function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value !== null && typeof value === "object") {
    return `{${Object.entries(value)
      .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
      .map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

export function digestJson(value) {
  return sha256(canonicalJson(value));
}

export const projects = {
  chromium: {
    name: "chrome",
    device: "Desktop Chrome",
    os: "ubuntu-24.04",
    kinds: ["chrome", "browser"],
  },
  firefox: {
    name: "firefox",
    device: "Desktop Firefox",
    os: "ubuntu-24.04",
    kinds: ["firefox", "browser"],
  },
  webkit: {
    name: "safari",
    device: "Desktop Safari",
    os: "macos-15",
    kinds: ["safari", "browser"],
  },
};

export function collectionFor(browser) {
  const project = projects[browser];
  if (!project) throw new Error("Unknown Ariviso browser shard");
  return {
    projectName: project.name,
    testDir: "app/src",
    testMatch: project.kinds.flatMap((kind) => [
      `**/test*-${kind}*.ts`,
      `**/tests/*-${kind}*.ts`,
    ]),
    testIgnore: [],
    grep: [{ source: "@visual", flags: "" }],
    grepInvert: [],
    shard: null,
    repeatEach: 1,
  };
}
