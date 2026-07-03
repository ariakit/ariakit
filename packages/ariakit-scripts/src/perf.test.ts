import type { CDPSession, Page } from "@playwright/test";
import { afterEach, expect, test } from "vitest";
import {
  getIntegerEnv,
  getUniquePerfLabel,
  parseScriptProfile,
  resolveScriptProfileSourceMaps,
  settleQuiescent,
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

  expect(profile).toContainEqual(
    expect.objectContaining({
      functionName: "recursive",
      url: "/app.js",
      line: 1,
      column: 1,
      selfTime: 5,
      totalTime: 5,
      hitCount: 1,
    }),
  );
  expect(profile).toContainEqual(
    expect.objectContaining({
      functionName: "wrapper",
      url: "/app.js",
      line: 5,
      column: 1,
      selfTime: 0,
      totalTime: 5,
      hitCount: 0,
    }),
  );
});

test("resolves script profile frames through source maps", async () => {
  const profile = parseScriptProfile({
    nodes: [
      {
        id: 1,
        callFrame: {
          functionName: "p",
          scriptId: "1",
          url: "https://example.com/_astro/dialog.abc.js",
          lineNumber: 0,
          columnNumber: 0,
        },
      },
    ],
    samples: [1],
    timeDeltas: [3000],
  });

  const resolved = await resolveScriptProfileSourceMaps(profile, {
    sourceMapUrls: new Map([["1", "dialog.abc.js.map"]]),
    loadSourceMap: async (url) => {
      expect(url).toBe("https://example.com/_astro/dialog.abc.js.map");
      return {
        version: 3,
        names: ["Dialog"],
        sources: ["../packages/ariakit-react-components/src/dialog/dialog.tsx"],
        mappings: "AAAAA",
      };
    },
  });

  expect(resolved).toHaveLength(1);
  expect(resolved[0]).toMatchObject({
    functionName: "Dialog",
    url: "packages/ariakit-react-components/src/dialog/dialog.tsx",
    line: 1,
    column: 1,
    generatedFunctionName: "p",
    generatedUrl: "https://example.com/_astro/dialog.abc.js",
    generatedLine: 1,
    generatedColumn: 1,
    sourceMapUrl: "https://example.com/_astro/dialog.abc.js.map",
    selfTime: 3,
    totalTime: 3,
    hitCount: 1,
  });
});

test("normalizes app source map URLs to repo paths", async () => {
  const profile = parseScriptProfile({
    nodes: [
      {
        id: 1,
        callFrame: {
          functionName: "p",
          scriptId: "1",
          url: "http://localhost:4321/_astro/dialog.js",
          lineNumber: 0,
          columnNumber: 0,
        },
      },
    ],
    samples: [1],
    timeDeltas: [1000],
  });

  const resolved = await resolveScriptProfileSourceMaps(profile, {
    sourceMapUrls: new Map([["1", "dialog.js.map"]]),
    loadSourceMap: async () => ({
      version: 3,
      names: ["DialogPerf"],
      sources: ["../../../src/sandbox/dialog-perf/index.react.tsx"],
      mappings: "AAAAA",
    }),
  });

  expect(resolved[0]).toMatchObject({
    functionName: "DialogPerf",
    url: "app/src/sandbox/dialog-perf/index.react.tsx",
    line: 1,
    column: 1,
  });
});

test("normalizes served app source map URLs to repo paths", async () => {
  const profile = parseScriptProfile({
    nodes: [
      {
        id: 1,
        callFrame: {
          functionName: "p",
          scriptId: "1",
          url: "http://localhost:4321/_astro/dialog.js",
          lineNumber: 0,
          columnNumber: 0,
        },
      },
    ],
    samples: [1],
    timeDeltas: [1000],
  });

  const resolved = await resolveScriptProfileSourceMaps(profile, {
    sourceMapUrls: new Map([["1", "dialog.js.map"]]),
    loadSourceMap: async () => ({
      version: 3,
      names: ["DialogPerf"],
      sources: [
        "http://localhost:4321/src/sandbox/dialog-perf/index.react.tsx",
      ],
      mappings: "AAAAA",
    }),
  });

  expect(resolved[0]?.url).toBe("app/src/sandbox/dialog-perf/index.react.tsx");
});

test("reuses source map cache across script profile resolutions", async () => {
  const profile = parseScriptProfile({
    nodes: [
      {
        id: 1,
        callFrame: {
          functionName: "p",
          scriptId: "1",
          url: "https://example.com/_astro/dialog.js",
          lineNumber: 0,
          columnNumber: 0,
        },
      },
    ],
    samples: [1],
    timeDeltas: [1000],
  });
  let loadCount = 0;
  const options = {
    sourceMapUrls: new Map([["1", "dialog.js.map"]]),
    traceMapCache: new Map(),
    loadSourceMap: async () => {
      loadCount += 1;
      return {
        version: 3 as const,
        names: ["Dialog"],
        sources: ["../packages/ariakit-react-components/src/dialog/dialog.tsx"],
        mappings: "AAAAA",
      };
    },
  };

  await resolveScriptProfileSourceMaps(profile, options);
  await resolveScriptProfileSourceMaps(profile, options);

  expect(loadCount).toBe(1);
});

/**
 * Drives `settleQuiescent` with a scripted sequence of tracked-work values in
 * ms. The value at index `i` is returned by the i-th metrics read; the last
 * value repeats when polling outlasts the sequence.
 */
function createSettleHarness(
  trackedWorkMs: number[],
  metricName = "ScriptDuration",
) {
  let reads = 0;
  let waits = 0;
  const page = {
    evaluate: async () => {},
    waitForTimeout: async () => {
      waits += 1;
    },
  } as unknown as Page;
  const cdp = {
    send: async () => {
      const index = Math.min(reads, trackedWorkMs.length - 1);
      reads += 1;
      // Tracked metrics are reported by CDP in seconds.
      return {
        metrics: [
          { name: metricName, value: (trackedWorkMs[index] ?? 0) / 1000 },
        ],
      };
    },
  } as unknown as CDPSession;
  return {
    page,
    cdp,
    getWaits: () => waits,
  };
}

test("settle returns after consecutive quiet polls", async () => {
  const harness = createSettleHarness([100, 100, 100, 100]);
  await settleQuiescent(harness.page, harness.cdp);
  expect(harness.getWaits()).toBe(3);
});

test("settle keeps polling while work grows and stops once it settles", async () => {
  const harness = createSettleHarness([100, 300, 700, 700, 700, 700]);
  await settleQuiescent(harness.page, harness.cdp);
  expect(harness.getWaits()).toBe(5);
});

test("settle resets quiet detection when late work appears", async () => {
  const harness = createSettleHarness([100, 100, 500, 500, 500, 500]);
  await settleQuiescent(harness.page, harness.cdp);
  expect(harness.getWaits()).toBe(5);
});

test("settle treats sub-epsilon increases as quiet", async () => {
  const harness = createSettleHarness([100, 101, 101.5, 102]);
  await settleQuiescent(harness.page, harness.cdp);
  expect(harness.getWaits()).toBe(3);
});

test("settle counts non-script rendering work as activity", async () => {
  const harness = createSettleHarness(
    [100, 300, 700, 700, 700, 700],
    "RecalcStyleDuration",
  );
  await settleQuiescent(harness.page, harness.cdp);
  expect(harness.getWaits()).toBe(5);
});

test("settle stops at the max wait bound when work never settles", async () => {
  const values = Array.from({ length: 20 }, (_, i) => i * 10);
  const harness = createSettleHarness(values);
  await settleQuiescent(harness.page, harness.cdp, {
    pollInterval: 10,
    maxWait: 50,
  });
  expect(harness.getWaits()).toBe(5);
});
