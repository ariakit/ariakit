import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/pull/6832
test("opens the dialog without highlighting an option", async () => {
  await click(q.button("Move to folder"));
  expect(q.listbox("Folders")).toBeVisible();
  expect(q.listbox("Folders")).not.toHaveAttribute("aria-activedescendant");
  expect(q.option("Inbox")).not.toHaveAttribute("data-active-item");
  expect(q.text("Highlighted: none")).toBeVisible();

  await press.ArrowDown();
  expect(q.option("Inbox")).toHaveAttribute("data-active-item");
  expect(q.text("Highlighted: Inbox")).toBeVisible();
});
