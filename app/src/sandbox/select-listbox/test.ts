import { focus, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// examples/select-listbox/test.ts
test("moves and selects within a persistent SelectList", async () => {
  const listbox = q.listbox("Favorite fruit");
  await focus(listbox);
  await press.ArrowDown();
  expect(q.option("Apple")).toHaveFocus();
  await press.ArrowDown();
  expect(q.option("Banana")).toHaveFocus();
  await press.Enter();
  expect(q.option("Banana")).toHaveAttribute("aria-selected", "true");
  expect(listbox).toHaveFocus();
});
