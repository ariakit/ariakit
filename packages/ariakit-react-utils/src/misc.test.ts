import type { HTMLAttributes } from "react";
import { expect, test } from "vitest";
import { mergeProps, setRef } from "./misc.ts";

test("mergeProps preserves base values for undefined overrides", () => {
  const base: HTMLAttributes<HTMLDivElement> = {
    id: "base",
    role: "checkbox",
    children: "base",
  };
  const overrides: HTMLAttributes<HTMLDivElement> = {
    id: undefined,
    role: undefined,
    children: null,
  };

  expect(mergeProps(base, overrides)).toEqual({
    id: "base",
    role: "checkbox",
    children: null,
  });
});

test("mergeProps ignores own __proto__ overrides", () => {
  const base: HTMLAttributes<HTMLDivElement> = {};
  const overrides = JSON.parse(
    '{"__proto__":{"id":"HIJACKED"},"constructor":"preserved"}',
  );

  const props = mergeProps(base, overrides);

  expect(Object.getPrototypeOf(props)).toBe(Object.prototype);
  expect(props.id).toBeUndefined();
  expect(Object.hasOwn(props, "constructor")).toBe(true);
  expect(Reflect.get(props, "constructor")).toBe("preserved");
});

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
