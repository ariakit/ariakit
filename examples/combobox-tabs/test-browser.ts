import { query } from "@ariakit/test/playwright";
import { expect } from "@playwright/test";
import { test } from "../test-utils.ts";

test("https://github.com/ariakit/ariakit/issues/3941", async ({ page }) => {
  const q = query(page);

  await q.combobox().click();
  await expect(q.dialog()).toBeVisible();

  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowLeft");
  await expect(q.tab("Guide 6")).toHaveAttribute("data-active-item");
  await expect(q.tab("Guide 6")).toHaveAttribute("data-focus-visible");
  await expect(q.tab("Guide 6")).toHaveAttribute("aria-selected", "true");

  await page.keyboard.type("ann");
  await page.keyboard.press("Backspace");
  await expect(q.tab("Guide 0")).toHaveAttribute("data-active-item");
  await expect(q.tab("Guide 0")).toHaveAttribute("data-focus-visible");
  await expect(q.tab("Guide 0")).toHaveAttribute("aria-selected", "true");

  await page.keyboard.press("ArrowRight");
  await expect(q.tab("Components 1")).toHaveAttribute("data-active-item");
  await expect(q.tab("Components 1")).toHaveAttribute("data-focus-visible");
  await expect(q.tab("Components 1")).toHaveAttribute("aria-selected", "true");

  await expect(q.tab("Guide 0")).toHaveAttribute("aria-selected", "false");
  await expect(q.tab("Guide 0")).not.toHaveAttribute("data-focus-visible");
  await expect(q.tab("Guide 0")).not.toHaveAttribute("data-active-item");
});
