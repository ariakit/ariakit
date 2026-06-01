import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("does not leak defaultChecked to the rendered menu item", () => {
  const item = q.menuitemradio.ensure("Compact");
  expect(item).toHaveAttribute("aria-checked", "true");
  expect(item).not.toHaveAttribute("data-default-checked-prop");
});
