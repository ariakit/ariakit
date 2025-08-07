import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { test } from "../test-utils.ts";

const getAnchor = (page: Page) =>
  page.getByRole("link", { name: "@ariakit.org" });
const getHovercard = (page: Page) =>
  page.getByRole("dialog", { name: "Ariakit" });

test("https://github.com/ariakit/ariakit/issues/2983", async ({ page }) => {
  await getAnchor(page).hover();
  await expect(getHovercard(page)).toBeVisible();
  await expect(page.getByText("Opened 1 times")).toBeVisible();
  await getAnchor(page).hover({ position: { y: 10, x: 10 } });
  await expect(page.getByText("Opened 1 times")).toBeVisible();
  await getAnchor(page).hover({ position: { y: 10, x: 20 } });
  await expect(page.getByText("Opened 1 times")).toBeVisible();
  await page.mouse.move(0, 0);
  await expect(getHovercard(page)).not.toBeVisible();
  await getAnchor(page).hover();
  await expect(getHovercard(page)).toBeVisible();
  await expect(page.getByText("Opened 2 times")).toBeVisible();
});
