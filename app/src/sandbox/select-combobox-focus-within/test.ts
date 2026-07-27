import { click, press, q, type } from "@ariakit/test";
import { expect, test } from "vitest";

// examples/select-combobox-focus-within/test.ts
test("tracks popover focus and exposes the cancel control", async () => {
  const select = q.combobox("Favorite fruit");

  await click(select);
  const search = q.combobox.ensure("Search foods");
  const cancel = q.button("Clear input");
  expect(search).toHaveFocus();
  expect(q.group()).toHaveClass("focus-within");
  expect(cancel).toHaveAttribute("data-visible");

  await type("ba");
  expect(q.option("Bacon")).toHaveFocus();
  await click(cancel);
  expect(search).toHaveValue("");

  await press.ShiftTab();
  expect(select).toHaveFocus();
  expect(q.group()).not.toHaveClass("focus-within");
});
