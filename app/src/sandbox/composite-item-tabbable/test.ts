import { press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// The composite element is published one commit after the items mount, so
// gating only on it would drop roving tabindex for composite stores that never
// get a composite element.
// https://github.com/ariakit/ariakit/pull/6832
test("keeps a single tab stop per composite once hydrated", async () => {
  await press.Tab();
  expect(q.option("Starred")).toHaveFocus();

  await press.Tab();
  expect(q.listbox("Virtual focus")).toHaveFocus();

  await press.Tab();
  expect(q.listbox("Seeded")).toHaveFocus();

  await press.Tab();
  expect(q.option("Spam")).toHaveFocus();
});
