import { expect } from "@playwright/test";
import { test } from "../test-utils.ts";

test("button receives focus on click", async ({ page }) => {
  const button = page.getByRole("button", { name: "Button" });
  await button.click();
  await expect(button).toBeFocused();
});
