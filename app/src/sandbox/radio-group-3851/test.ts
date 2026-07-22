import { q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/3851
test("disabled prop disables the group and radios", () => {
  expect(q.radiogroup("Fruits")).toHaveAttribute("aria-disabled", "true");
  expect(q.radio("Apple")).toBeDisabled();
  expect(q.radio("Orange")).toBeDisabled();
  expect(q.radio("Watermelon")).toBeDisabled();
  expect(q.radio("Banana")).toHaveAttribute("aria-disabled", "true");
});
