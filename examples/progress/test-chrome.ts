import { expect } from "@playwright/test";
import { test } from "../test-utils.ts";

test("progress component", async ({ page }) => {
  await page.goto("http://localhost:3000/previews/progress");

  const element = await page.getByRole("progressbar");
  await expect(element).toBeVisible();
});
