import { expect } from "@ariakit/test/playwright";
import { test } from "../test-utils.ts";

test("checkbox receives focus on label click", async ({ page }) => {
  const checkbox = page.getByRole("checkbox");
  await page.locator("label").click();
  await expect(checkbox).toBeFocused();
});
