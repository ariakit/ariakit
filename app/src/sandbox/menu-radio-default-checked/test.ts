import { expect, test, q } from "../../../../browser-test-utils.ts";

test("does not leak defaultChecked to the rendered menu item", () => {
  const item = q.menuitemradio.ensure("Compact");
  expect(item).toHaveAttribute("aria-checked", "true");
  expect(item).not.toHaveAttribute("data-default-checked-prop");
});
