import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("renders a horizontal separator", () => {
  const separator = q.separator();
  expect(separator).toHaveProperty("tagName", "HR");
  expect(separator).toHaveAttribute("role", "separator");
  expect(separator).toHaveAttribute("aria-orientation", "horizontal");
});
