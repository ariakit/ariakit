import { expect, test } from "vitest";
import { getVisualProject } from "./ci-visual.js";

test("gets the browser project from screenshot upload steps", () => {
  expect(getVisualProject("Upload screenshots (chrome)")).toBe("chrome");
  expect(getVisualProject("Upload screenshots (Safari)")).toBe("safari");
});

test("ignores unrelated workflow steps", () => {
  expect(getVisualProject("Upload test results to GitHub")).toBeUndefined();
});
