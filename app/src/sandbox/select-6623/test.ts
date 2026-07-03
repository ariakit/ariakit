import { click, q, sleep } from "@ariakit/test";
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

// https://github.com/ariakit/ariakit/issues/6623
test("discards the redirect when the option loses focus before the listbox is available", async () => {
  await click(q.checkbox("Show search"));
  await click(q.combobox("Favorite fruit"));
  await expect.poll(q.listbox.lazy()).toBeVisible();
  expect(q.textbox("Search fruits")).toHaveFocus();
  // Give a stray redirect a chance to fire before asserting focus stayed put.
  await sleep(100);
  expect(q.textbox("Search fruits")).toHaveFocus();
  expect(q.listbox()).not.toHaveFocus();
});
