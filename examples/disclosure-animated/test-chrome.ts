import { query } from "@ariakit/test/playwright";
import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { test } from "../test-utils.ts";

function getWrapper(page: Page) {
  return page.locator(".content-wrapper");
}

test.describe.configure({ retries: 2 });

test("expand/collapse disclosure", async ({ page }) => {
  const q = query(page);

  await expect(getWrapper(page)).not.toBeVisible();

  // Expand
  await q.button("What are vegetables?").click();
  await expect(getWrapper(page)).toBeVisible();

  const height = await page
    .locator(".content")
    .evaluate((el) => el.clientHeight);
  const hpx = `${height}px`;

  await expect(getWrapper(page)).not.toHaveCSS("grid-template-rows", hpx);
  await expect(getWrapper(page)).toHaveCSS("grid-template-rows", hpx);

  // Collapse
  await q.button("What are vegetables?").click();
  await expect(getWrapper(page)).toBeVisible();
  await expect(getWrapper(page)).not.toHaveCSS("grid-template-rows", hpx);
  await expect(getWrapper(page)).toBeVisible();
  await expect(getWrapper(page)).toHaveCSS("grid-template-rows", "0fr");
  await expect(getWrapper(page)).not.toBeVisible();

  // Expand
  await page.keyboard.press("Enter");
  await expect(getWrapper(page)).toBeVisible();
  await expect(getWrapper(page)).not.toHaveCSS("grid-template-rows", hpx);
  await expect(getWrapper(page)).toHaveCSS("grid-template-rows", hpx);

  // Collapse
  await page.keyboard.press("Enter");
  await expect(getWrapper(page)).toBeVisible();
  await expect(getWrapper(page)).not.toHaveCSS("grid-template-rows", "0fr");
  await expect(getWrapper(page)).toBeVisible();
  await expect(getWrapper(page)).toHaveCSS("grid-template-rows", "0fr");
  await expect(getWrapper(page)).not.toBeVisible();
});
