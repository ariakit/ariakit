import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

const labels = [
  "Simple",
  "With Tabs",
  "With Tabs (2 columns)",
  "With Tabs (3 columns)",
];

const tabs = ["With Tabs", "With Tabs (2 columns)", "With Tabs (3 columns)"];

const grids = ["With Tabs (2 columns)", "With Tabs (3 columns)"];

withFramework(import.meta.dirname, async ({ test }) => {
  for (const label of labels) {
    test(`${label} opens, closes, filters, and resets`, async ({ page, q }) => {
      await q.button(label).click();
      await expect(q.dialog("Command Menu")).toBeVisible();
      const firstOption = q.option("Getting Started");
      await expect(firstOption).toHaveAttribute("data-active-item");
      await expect(firstOption).not.toHaveAttribute("data-focus-visible");

      const initialCount = await page.getByRole("option").count();
      await page.keyboard.type("but");
      await expect(page.getByRole("option")).toHaveCount(5);
      await expect(q.option("Button")).toHaveAttribute("data-active-item");
      await expect(q.option("Button")).toHaveAttribute("data-focus-visible");

      await page.keyboard.press("Escape");
      await expect(q.dialog("Command Menu")).not.toBeAttached();
      await q.button(label).click();
      await expect(page.getByRole("option")).toHaveCount(initialCount);
      await expect(q.combobox()).toHaveValue("");

      await page.mouse.click(1, 1);
      await expect(q.dialog("Command Menu")).not.toBeAttached();
      await q.button(label).click();
      await q.button("Esc").click();
      await expect(q.dialog("Command Menu")).not.toBeAttached();
    });
  }

  for (const label of tabs) {
    test(`${label} selects tabs with Tab and arrow keys`, async ({
      page,
      q,
    }) => {
      await q.button(label).click();
      await expect(q.tab(/^All/)).toHaveAttribute("aria-selected", "true");
      await expect(q.tab(/^All/)).not.toHaveAttribute("data-active-item");
      await expect(q.tabpanel(/^All/)).toBeVisible();

      await page.keyboard.press("Tab");
      await expect(q.tab(/^All/)).toHaveAttribute("aria-selected", "false");
      await expect(q.tabpanel(/^All/)).not.toBeAttached();
      await expect(q.tab(/^Guide/)).toHaveAttribute("aria-selected", "true");
      await expect(q.tab(/^Guide/)).toHaveAttribute("data-active-item");
      await expect(q.tabpanel(/^Guide/)).toBeVisible();

      await page.keyboard.press("ArrowRight");
      await expect(q.tab(/^Guide/)).toHaveAttribute("aria-selected", "false");
      await expect(q.tabpanel(/^Guide/)).not.toBeAttached();
      await expect(q.tab(/^Components/)).toHaveAttribute(
        "aria-selected",
        "true",
      );
      await expect(q.tab(/^Components/)).toHaveAttribute("data-active-item");
      await expect(q.tabpanel(/^Components/)).toBeVisible();
      await page.keyboard.press("ArrowLeft");
      await expect(q.tab(/^Guide/)).toHaveAttribute("aria-selected", "true");

      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await expect(q.button("Esc")).toBeFocused();
      await expect(q.button("Esc")).toHaveAttribute("data-focus-visible");
      await expect(q.tab(/^Examples/)).toHaveAttribute("aria-selected", "true");
      await expect(q.tab(/^Examples/)).toHaveAttribute("data-active-item");
      await expect(q.tab(/^Examples/)).not.toHaveAttribute(
        "data-focus-visible",
      );
      await expect(q.tabpanel(/^Examples/)).toBeVisible();

      await page.keyboard.press("Shift+Tab");
      await expect(q.button("Esc")).not.toBeFocused();
      await expect(q.button("Esc")).not.toHaveAttribute("data-focus-visible");
      await expect(q.tab(/^Examples/)).toHaveAttribute("data-focus-visible");
    });
  }

  for (const label of grids) {
    test(`${label} navigates its grid and shifts focus`, async ({
      page,
      q,
    }) => {
      await q.button(label).click();
      await page.keyboard.press("ArrowRight");
      const secondOption = q.option("Styling");
      await expect(secondOption).toHaveAttribute("data-active-item");
      await expect(secondOption).toHaveAttribute("data-focus-visible");
      await page.keyboard.press("ArrowUp");
      await expect(secondOption).not.toHaveAttribute("data-active-item");
      await expect(secondOption).not.toHaveAttribute("data-focus-visible");
      await expect(q.tab(/^All/)).toHaveAttribute("aria-selected", "true");
      await expect(q.tab(/^All/)).toHaveAttribute("data-active-item");
      await expect(q.tab(/^All/)).toHaveAttribute("data-focus-visible");

      await page.reload();
      await q.button(label).click();
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      const wrappedOption = q.option("Component providers");
      await expect(wrappedOption).toHaveAttribute("data-active-item");
      await expect(wrappedOption).toHaveAttribute("data-focus-visible");
      await page.keyboard.press("ArrowUp");
      await page.keyboard.press("ArrowUp");
      await expect(q.tab(/^All/)).toHaveAttribute("data-active-item");
    });
  }
});
