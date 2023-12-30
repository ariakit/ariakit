import type { Locator, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

function query(locator: Page | Locator) {
  return {
    combobox: () => locator.getByPlaceholder("e.g., Apple"),
    popover: () => locator.getByRole("listbox"),
    option: (name: string) =>
      locator.getByRole("option", { name, exact: true }),
  };
}

test.beforeEach(async ({ page }) => {
  await page.goto("/previews/combobox-multiple", { waitUntil: "networkidle" });
});

test("scroll offscreen item into view after selecting it", async ({ page }) => {
  const q = query(page);
  await q.combobox().click();
  await page.keyboard.type("pin");
  await expect(q.option("Pineapple")).toBeInViewport();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(q.combobox()).toHaveValue("");
  await expect(q.option("Hot dog")).not.toBeInViewport();
  await expect(q.option("Pasta")).toBeInViewport();
  await expect(q.option("Pineapple")).toBeInViewport();
  await expect(q.option("Pineapple")).toHaveAttribute("data-active-item", "");
  await expect(q.option("Pineapple")).toHaveAttribute("aria-selected", "true");
});

test("scroll after hovering over an item", async ({ page }) => {
  const q = query(page);
  await q.combobox().click();
  await q.option("Apple").hover();
  await page.mouse.wheel(0, 200);
  await expect(q.option("Apple")).not.toBeInViewport();
});
