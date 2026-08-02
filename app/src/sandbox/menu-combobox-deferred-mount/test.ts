import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("focuses a deferred combobox after clicking the select", async () => {
  await click(q.combobox("Current page"));
  await expect.poll(() => q.combobox("Search pages")).toHaveFocus();
});

test("focuses a deferred combobox after opening the menu with a shortcut", async () => {
  await press("k", null, { ctrlKey: true });
  await expect.poll(() => q.combobox("Search pages")).toHaveFocus();
});
