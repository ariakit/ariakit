import assert from "node:assert/strict";
import { test } from "node:test";
import { verifyItemCoverage } from "./coverage.mjs";

const registry = {
  schemaVersion: 2,
  items: {
    "dialog/open/main": { c: ["react/desktop/light", "react/desktop/dark"] },
    "dialog/closed/main": { c: ["react/desktop/light"] },
  },
};
const tests = [{ id: "open" }, { id: "closed" }];
const captures = [
  {
    itemKey: "dialog/open/main",
    variantKey: "chromium/react/desktop/light",
    testId: "open",
  },
  {
    itemKey: "dialog/open/main",
    variantKey: "chromium/react/desktop/dark",
    testId: "open",
  },
  {
    itemKey: "dialog/closed/main",
    variantKey: "chromium/react/desktop/light",
    testId: "closed",
  },
];

test("new explicit variants are accepted while trusted pairs remain required", () => {
  assert.deepEqual(
    verifyItemCoverage(
      registry,
      {
        tests,
        captures: [
          ...captures,
          {
            itemKey: "dialog/new/main",
            variantKey: "chromium/react/desktop/light",
            testId: "open",
          },
          {
            itemKey: "dialog/open/main",
            variantKey: "chromium/solid/desktop/light",
            testId: "open",
          },
        ],
      },
      "chromium",
    ),
    { requiredItems: 2, requiredVariants: 3, addedItems: 1, addedVariants: 2 },
  );
});

test("dropping dark mode fails even while the item still has a capture", () => {
  assert.throws(
    () =>
      verifyItemCoverage(
        registry,
        { tests, captures: [captures[0], captures[2]] },
        "chromium",
      ),
    /missed 1 trusted variants: dialog\/open\/main chromium\/react\/desktop\/dark/,
  );
});

test("a removed item fails until trusted main drops its requirement", () => {
  assert.throws(
    () =>
      verifyItemCoverage(
        registry,
        { tests: tests.slice(0, 1), captures: captures.slice(0, 2) },
        "chromium",
      ),
    /missed 1 trusted variants: dialog\/closed\/main/,
  );
});

test("every collected visual test must emit a capture", () => {
  assert.throws(
    () =>
      verifyItemCoverage(
        registry,
        { tests: [...tests, { id: "new" }], captures },
        "chromium",
      ),
    /tests without captures: new/,
  );
});
