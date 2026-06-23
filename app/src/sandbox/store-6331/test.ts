import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// Reproduces https://github.com/ariakit/ariakit/issues/6331
test("keeps parent stores in sync when a parent clamps the child value", async () => {
  await click(q.button.ensure("Add 3"));
  expect(q.status.ensure("Selected")).toHaveTextContent("3");
  expect(q.status.ensure("Cart")).toHaveTextContent("3");
  expect(q.status.ensure("Order summary")).toHaveTextContent("3");

  await click(q.button.ensure("Add 3"));
  expect(q.status.ensure("Selected")).toHaveTextContent("5");
  expect(q.status.ensure("Cart")).toHaveTextContent("5");
  expect(q.status.ensure("Order summary")).toHaveTextContent("5");
});
