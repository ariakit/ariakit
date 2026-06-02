import { expect, test } from "vitest";
import { setRef } from "./misc.ts";

test("setRef returns function ref cleanup", () => {
  const element = document.createElement("div");
  const cleanup = () => {};
  const ref = () => cleanup;

  expect(setRef(ref, element)).toBe(cleanup);
});

test("setRef ignores non-function callback ref returns", () => {
  const element = document.createElement("div");

  // @ts-expect-error Deliberately exercises a JS callback ref that returns a
  // non-cleanup value.
  expect(setRef(() => element, element)).toBeUndefined();
});
