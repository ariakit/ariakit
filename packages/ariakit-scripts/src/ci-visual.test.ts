import { expect, test } from "vitest";
import { getVisualProject } from "./ci-visual.js";

test("gets the browser project from direct and reusable workflow job names", () => {
  expect(getVisualProject("Test Chrome")).toBe("chrome");
  expect(getVisualProject("App / Test Firefox")).toBe("firefox");
});

test("ignores unrelated workflow jobs", () => {
  expect(getVisualProject("App / Build app")).toBeUndefined();
});
