import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("renders an unlabeled group with native buttons", () => {
  const group = q.group();
  expect(group).toBeVisible();
  expect(group).not.toHaveAttribute("aria-label");
  expect(group).not.toHaveAttribute("aria-labelledby");
  expect(q.button("Bold")).toHaveAttribute("type", "button");
  expect(q.button("Italic")).toHaveAttribute("type", "button");
  expect(q.button("Underline")).toHaveAttribute("type", "button");
});
