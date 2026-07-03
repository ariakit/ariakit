import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/6623
test("redirects focus to the listbox when an option is focused on mount", async () => {
  await click(q.combobox("Favorite fruit"));
  await expect.poll(q.listbox.lazy()).toBeVisible();
  await expect.poll(q.listbox.lazy()).toHaveFocus();
  // The custom toHaveFocus matcher (vitest.setup.ts) passes here through the
  // focused listbox's aria-activedescendant pointing at the option.
  expect(q.option("Banana")).toHaveFocus();
});
