import { expect, test } from "vitest";
import { createRef } from "./reactivity.ts";

test("reset restores a function initial value without invoking it", () => {
  let calls = 0;
  const initialValue = () => {
    calls += 1;
  };
  const nextValue = () => {};

  const ref = createRef(initialValue);
  ref.set(() => nextValue);
  ref.reset();

  expect(calls).toBe(0);
  expect(ref.current).toBe(initialValue);
});
