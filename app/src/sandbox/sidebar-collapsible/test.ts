import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("collapses provider-driven sidebars from the toggle", async () => {
  expect(q.dialog("Primary sidebar")).toBeVisible();

  await click(q.button.ensure("Collapse sidebar"));

  await expect.poll(q.dialog.hidden.lazy("Primary sidebar")).toBeNull();
  expect(q.button("Expand sidebar")).toBeVisible();

  await click(q.button.ensure("Expand sidebar"));

  expect(q.dialog("Primary sidebar")).toBeVisible();
  expect(q.button("Collapse sidebar")).toHaveFocus();
});

test("keeps standalone sidebars visible inside other dialogs", async () => {
  expect(q.text("Nested standalone sidebar content")).toBeVisible();
});
