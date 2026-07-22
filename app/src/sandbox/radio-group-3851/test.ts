import { q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/3851
test("disabled prop disables the radios", () => {
  expect(q.radio("Apple")).toBeDisabled();
  expect(q.radio("Orange")).toBeDisabled();
  expect(q.radio("Watermelon")).toBeDisabled();
});
