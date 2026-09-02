import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/7315
test("does not keep the previous disclosure label", async () => {
  await click(q.button("Initial disclosure"));

  const menu = q.menu();
  expect(menu).toBeVisible();
  expect(menu).toHaveAttribute("aria-labelledby", "initial-disclosure");

  await click(q.button("Replacement disclosure"));

  expect(q.status("Current disclosure")).toHaveTextContent(
    "Replacement disclosure",
  );
  expect(menu).not.toHaveAttribute("aria-labelledby");
});
