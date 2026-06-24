import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// Reproduces https://github.com/ariakit/ariakit/issues/6296
test("honors prevented mousedown on disclosure", async () => {
  await click(q.textbox.ensure("Notes"));
  expect(q.textbox("Notes")).toHaveFocus();

  await click(q.button.ensure("Show popup"));

  expect(q.listbox()).toBeVisible();
  expect(q.textbox("Notes")).toHaveFocus();
  expect(q.combobox("Fruit")).not.toHaveFocus();
});
