import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("names each speed by its label and describes it by its latency", () => {
  expect(q.radio("Fast")).toHaveAccessibleDescription("50 ms");
  expect(q.radio("Medium")).toHaveAccessibleDescription("250 ms");
  expect(q.radio("Slow")).toHaveAccessibleDescription("1500 ms");
});
