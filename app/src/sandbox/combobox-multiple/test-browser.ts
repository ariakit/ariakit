import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  function query(locator: Page | Locator) {
    return {
      combobox: () => locator.getByPlaceholder("e.g., Apple"),
      popover: () => locator.getByRole("listbox"),
      option: (name: string) =>
        locator.getByRole("option", { name, exact: true }),
    };
  }

  test("scroll offscreen item into view after selecting it", async ({
    page,
  }) => {
    const q = query(page);
    await q.combobox().click();
    await expect(q.combobox()).toHaveAttribute("aria-expanded", "true");
    await page.mouse.move(0, 0);
    await page.keyboard.type("pin");
    await expect(q.option("Hot dog")).toHaveCount(0);
    await expect(q.popover()).toHaveAttribute("aria-busy", "false");
    await expect(q.option("Pineapple")).toBeInViewport();
    await expect(q.combobox()).toBeFocused();
    await q.combobox().press("ArrowDown");
    await expect(q.option("Pineapple")).toHaveAttribute("data-active-item");
    await q.combobox().press("Enter");
    await expect(q.combobox()).toHaveValue("");
    await expect(q.option("Hot dog")).not.toBeInViewport();
    await expect(q.option("Pasta")).toBeInViewport();
    await expect(q.option("Pineapple")).toBeInViewport();
    await expect(q.option("Pineapple")).toHaveAttribute("data-active-item");
    await expect(q.option("Pineapple")).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  test("scroll after hovering over an item", async ({ page }) => {
    const q = query(page);
    await q.combobox().click();
    await q.option("Apple").hover();
    await page.mouse.wheel(0, 200);
    await expect(q.option("Apple")).not.toBeInViewport();
  });
});
