import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("toggles the navigation sidebar", async () => {
  const toggle = q.button("Toggle navigation");
  expect(toggle).toHaveAttribute("aria-expanded", "true");
  await click(toggle);
  expect(toggle).toHaveAttribute("aria-expanded", "false");
  await click(toggle);
  expect(toggle).toHaveAttribute("aria-expanded", "true");
});
