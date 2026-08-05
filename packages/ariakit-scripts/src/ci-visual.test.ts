import { expect, test } from "vitest";
import { getVisualPlatform } from "./ci-visual.js";

test("gets the runner platform from screenshot upload steps", () => {
  expect(getVisualPlatform("Upload screenshots (ubuntu-latest)")).toBe(
    "ubuntu-latest",
  );
  expect(getVisualPlatform("Upload screenshots (macos-latest)")).toBe(
    "macos-latest",
  );
  expect(getVisualPlatform("Upload screenshots (macOS-latest)")).toBe(
    "macOS-latest",
  );
});

test("ignores unrelated workflow steps", () => {
  expect(getVisualPlatform("Upload test results to GitHub")).toBeUndefined();
  expect(getVisualPlatform("Upload screenshots ()")).toBeUndefined();
});
