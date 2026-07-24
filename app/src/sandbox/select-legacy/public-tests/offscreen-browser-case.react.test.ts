import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import type { ShowLegacyPublicCase } from "./animated-browser-case.react.test.ts";

// examples/select-combobox-offscreen-various/test-chrome.ts
export async function checkLegacySelectComboboxOffscreenLayout(
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
