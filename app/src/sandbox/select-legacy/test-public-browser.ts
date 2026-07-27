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
});
