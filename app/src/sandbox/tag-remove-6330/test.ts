import { q } from "@ariakit/test";
import { expect, test } from "vitest";

// Reproduces https://github.com/ariakit/ariakit/issues/6330
test("exposes standalone TagRemove with visible text as a named button", () => {
  const removeButton = q.button.ensure("Remove React filter");
  expect(removeButton).not.toHaveAttribute("aria-hidden", "true");
  expect(
    document.querySelector(
      '[aria-label="Press Delete or Backspace to remove"]',
    ),
  ).toHaveAttribute("aria-hidden", "true");
  expect(q.button("Remove React")).not.toBeInTheDocument();
});

test("labels an icon-only standalone TagRemove from its value", () => {
  const removeButton = q.button.ensure("Remove Vue");
  expect(removeButton).not.toHaveAttribute("aria-hidden", "true");
});
