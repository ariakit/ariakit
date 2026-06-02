import { afterEach, expect, test } from "vitest";
import {
  getIntegerEnv,
  getUniquePerfLabel,
  parseScriptProfile,
} from "./perf.ts";

const envName = "PERF_ITERATIONS";
const originalValue = process.env[envName];

afterEach(() => {
  if (originalValue == null) {
    delete process.env[envName];
    return;
  }
  process.env[envName] = originalValue;
});

test("gets integer env values with range validation", () => {
  process.env[envName] = "3";
  expect(getIntegerEnv(envName, 10, { min: 1 })).toBe(3);

  for (const value of ["", "2.5", "0", "-1"]) {
    process.env[envName] = value;
    expect(getIntegerEnv(envName, 10, { min: 1 })).toBe(10);
  }

  process.env[envName] = "0";
  expect(getIntegerEnv(envName, 1, { min: 0 })).toBe(0);
});

test("resolves duplicate perf labels with exact label counts", () => {
  expect(getUniquePerfLabel(["foo #2"], "foo")).toBe("foo");
  expect(getUniquePerfLabel(["foo", "foo #2"], "foo")).toBe("foo #3");
  expect(getUniquePerfLabel(["foo", "foo #3"], "foo")).toBe("foo #2");
});

test("does not double-count recursive script profile frames", () => {
  const callFrame = {
    functionName: "recursive",
    scriptId: "1",
    url: "https://example.com/app.js",
    lineNumber: 0,
    columnNumber: 0,
  };

  const profile = parseScriptProfile({
    nodes: [
      {
        id: 1,
        callFrame: {
          functionName: "(root)",
          scriptId: "0",
          url: "",
          lineNumber: 0,
          columnNumber: 0,
        },
        children: [2],
      },
      {
        id: 2,
        callFrame: {
          functionName: "wrapper",
          scriptId: "1",
          url: "https://example.com/app.js",
          lineNumber: 4,
          columnNumber: 0,
        },
        children: [3],
      },
      { id: 3, callFrame, children: [4] },
      { id: 4, callFrame },
    ],
    samples: [4],
    timeDeltas: [5000],
  });

  expect(profile).toContainEqual({
    functionName: "recursive",
    url: "/app.js",
    line: 1,
    column: 1,
    selfTime: 5,
    totalTime: 5,
    hitCount: 1,
  });
  expect(profile).toContainEqual({
    functionName: "wrapper",
    url: "/app.js",
    line: 5,
    column: 1,
    selfTime: 0,
    totalTime: 5,
    hitCount: 0,
  });
});
