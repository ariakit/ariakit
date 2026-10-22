import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("render horizontal separator", () => {
  expect(q.separator().tagName).toBe("HR");
  expect(q.separator()).toHaveAttribute("aria-orientation", "horizontal");
});
