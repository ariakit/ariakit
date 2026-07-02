// See https://github.com/ariakit/ariakit/issues/6322
import { click, q, type } from "@ariakit/test";
import { expect, test } from "vitest";

test("typing into a dialog with an inline portalRef keeps focus and value", async () => {
  await click(q.button.ensure("Open dialog"));
  expect(q.dialog("Profile")).toBeVisible();

  await click(q.textbox.ensure("Name"));
  await type("hello");

  // Before the fix, the first keystroke re-renders the parent, the new inline
  // portalRef identity recreates the portal node, and the remounted dialog
  // moves focus to the Close button, so only "h" lands in the field.
  expect(q.textbox("Name")).toHaveValue("hello");
  expect(q.textbox("Name")).toHaveFocus();
});

test("typing into a portal with an inline portalRef keeps focus and value", async () => {
  await click(q.textbox.ensure("Notes"));
  await type("hello");

  // Before the fix, the portal node is recreated on every keystroke and focus
  // falls back to the body, so only "h" lands in the field.
  expect(q.textbox("Notes")).toHaveValue("hello");
  expect(q.textbox("Notes")).toHaveFocus();
});
