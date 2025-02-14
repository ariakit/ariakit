import { query } from "@ariakit/test/playwright";
import { expect } from "@playwright/test";
import { test } from "../test-utils.ts";

const SELECT_TAB = "Select with Tab";
const SELECT_COMBOBOX_TAB = "Select with Combobox and Tab";
const TAB = [SELECT_TAB, SELECT_COMBOBOX_TAB];

for (const label of TAB) {
  test(`${label} - reset scroll position when switching tabs`, async ({
    page,
  }) => {
    const q = query(page);
    await q.combobox(label).click();

    // Assert main option is selected
    await expect(q.option().first()).toHaveAttribute("aria-selected", "true");
    await expect(q.option().first()).toHaveAttribute(
      "data-active-item",
      "true",
    );

    // Select one of the options at the bottom
    await q.option().last().click();
    await expect(q.dialog()).not.toBeVisible();

    // Assert last option is selected and visible in the viewport
    await page.keyboard.press("ArrowDown");
    await expect(q.option().first()).not.toBeInViewport();
    await expect(q.option().last()).toBeInViewport();
    await expect(q.option().last()).toHaveAttribute("aria-selected", "true");
    await expect(q.option().last()).toHaveAttribute("data-active-item", "true");
    await expect(q.option().last()).toHaveAttribute(
      "data-focus-visible",
      "true",
    );

    // Move up until the selected option is no longer in the viewport
    await page.keyboard.press("PageUp");
    await expect(q.option().last()).not.toBeInViewport();

    // Switch to Tags tab
    await page.keyboard.press("ArrowRight");
    await expect(q.option().first()).toBeInViewport();
    await expect(q.option().last()).not.toBeInViewport();

    // Switch back to Branches tab
    await page.keyboard.press("ArrowLeft");
    await expect(q.option().first()).not.toBeInViewport();
    await expect(q.option().last()).toBeInViewport();
  });
}
