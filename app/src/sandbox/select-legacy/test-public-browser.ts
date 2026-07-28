import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

type ShowLegacyPublicCase = (caseName: string) => Promise<void>;

const animatedCases = [
  ["public-select-animated", "Animated favorite fruit"],
  ["public-select-animated-store", "Animated store favorite fruit"],
] as const;

// examples/select-animated/test-browser.ts
// examples/select-animated-store/test-browser.ts
async function checkLegacyAnimatedSelects(
  page: Page,
  showCase: ShowLegacyPublicCase,
) {
  for (const [caseName, label] of animatedCases) {
    await showCase(caseName);
    const select = page.getByRole("combobox", { name: label });
    await select.focus();
    await page.evaluate(() => window.scrollTo({ top: 100 }));
    await page.keyboard.press("Enter");
    await expect(page.getByRole("listbox", { name: label })).toBeVisible();
    expect(await page.evaluate(() => window.scrollY)).toBe(100);
    await page.keyboard.press("Escape");
    await expect(select).toBeFocused();
  }
}

// examples/select-combobox-offscreen-various/test-chrome.ts
async function checkLegacySelectComboboxOffscreenLayout(
  page: Page,
  showCase: ShowLegacyPublicCase,
) {
  await showCase("public-select-combobox-offscreen");
  await page
    .getByRole("combobox", { name: "Offscreen searchable legacy country" })
    .click();

  const selectedItem = page.getByRole("option", {
    name: "Dominica",
    exact: true,
  });
  await expect(selectedItem).toBeInViewport();
  await expect(selectedItem).toHaveAttribute("aria-selected", "true");

  const passiveItem = page.locator("[data-offscreen]").first();
  await expect(passiveItem).toHaveAttribute("data-offscreen");
  await expect(passiveItem).not.toHaveAttribute("offscreenmode");
  await expect(passiveItem).not.toHaveAttribute("offscreenroot");
}

withFramework(import.meta.dirname, async ({ test }) => {
  test("preserves animated and offscreen legacy Select behavior", async ({
    page,
  }) => {
    const showCase = async (caseName: string) => {
      await page
        .getByRole("button", { name: `Show ${caseName}`, exact: true })
        .click();
    };

    await checkLegacyAnimatedSelects(page, showCase);
    await checkLegacySelectComboboxOffscreenLayout(page, showCase);
  });

  // https://github.com/ariakit/ariakit/issues/6319
  test("arrow key on the closed legacy Select does not freeze the page when all following items have no value", async ({
    page,
    q,
  }) => {
    await q.button("Show public-select-valueless-items").click();
    const select = q.combobox("Valueless favorite fruit");
    await select.click();
    await test.expect(q.option("Cherry")).toBeVisible();
    await page.keyboard.press("Escape");
    await test.expect(q.option("Cherry")).toBeHidden();
    await test.expect(select).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.option("Cherry")).toBeVisible();
    await test.expect(q.option("Cherry")).toHaveAttribute("data-active-item");
  });

  // https://github.com/ariakit/ariakit/issues/6319
  test("arrow keys on the closed legacy Select skip the trailing item without value", async ({
    page,
    q,
  }) => {
    await q.button("Show public-select-valueless-items").click();
    const select = q.combobox("Valueless favorite color");
    await select.click();
    await test.expect(q.option("Green")).toBeVisible();
    await page.keyboard.press("Escape");
    await test.expect(q.option("Green")).toBeHidden();
    await test.expect(select).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await test.expect(select).toContainText("Blue");
    await page.keyboard.press("ArrowDown");
    await test.expect(select).toContainText("Blue");
    await page.keyboard.press("ArrowUp");
    await test.expect(select).toContainText("Green");
  });

  // https://github.com/ariakit/ariakit/issues/6319
  test("arrow keys on the closed legacy Select with focusLoop wrap past the item without value", async ({
    page,
    q,
  }) => {
    await q.button("Show public-select-valueless-items").click();
    const select = q.combobox("Valueless favorite shape");
    await select.click();
    await test.expect(q.option("Triangle")).toBeVisible();
    await page.keyboard.press("Escape");
    await test.expect(q.option("Triangle")).toBeHidden();
    await test.expect(select).toBeFocused();
    await test.expect(select).toContainText("Triangle");
    await page.keyboard.press("ArrowDown");
    await test.expect(select).toContainText("Square");
  });
});
