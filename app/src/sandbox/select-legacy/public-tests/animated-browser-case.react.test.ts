import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

// Keep this helper loader-specific so the workerd type-check excludes it.
export type ShowLegacyPublicCase = (caseName: string) => Promise<void>;

const animatedCases = [
  ["public-select-animated", "Animated favorite fruit"],
  ["public-select-animated-store", "Animated store favorite fruit"],
] as const;

// examples/select-animated/test-browser.ts
// examples/select-animated-store/test-browser.ts
export async function checkLegacyAnimatedSelects(
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
