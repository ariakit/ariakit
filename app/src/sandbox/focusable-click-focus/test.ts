import { click, press, q, type } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/7099
// Nothing here is a composite, so this pins the modality rule on a plain
// Focusable rather than on composite navigation.
test("shows focus-visible on a modified navigation key", async () => {
  const button = q.button("Button");

  await click(button);
  expect(button).toHaveFocus();
  expect(button).not.toHaveAttribute("data-focus-visible");

  await press.ArrowDown(null, { altKey: true });
  expect(button).toHaveAttribute("data-focus-visible", "true");
});

// https://github.com/ariakit/ariakit/issues/7215
test("preserves the nodeType form data key", async () => {
  await click(q.button("Add node editor"));
  await type("element", q.textbox("Node type"));
  await click(q.button("Save node"));
  expect(q.text('Submitted data: {"nodeType":"element"}')).toBeVisible();
});
