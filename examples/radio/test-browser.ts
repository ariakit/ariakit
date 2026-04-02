import { expect } from "@ariakit/test/playwright";
import { test } from "../test-utils.ts";

test("radio receives focus on label click", async ({ page }) => {
  const radio = page.getByRole("radio", { name: "apple" });
  await page.locator("label", { hasText: "apple" }).click();
  await expect(radio).toBeFocused();
});
