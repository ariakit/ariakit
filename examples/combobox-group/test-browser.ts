import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const getCombobox = (page: Page) => page.getByRole("combobox");

function getSelectionValue(page: Page) {
  return getCombobox(page).evaluate((element) => {
    const input = element as HTMLInputElement;
    const { selectionStart, selectionEnd } = input;
    const selectionValue = input.value.slice(selectionStart!, selectionEnd!);
    return selectionValue;
  });
}

test.beforeEach(async ({ page }) => {
  await page.goto("/previews/combobox-group", { waitUntil: "networkidle" });
});

test("maintain completion string while typing", async ({ page }) => {
  await getCombobox(page).click();
  await page.keyboard.type("av");
  await expect(getCombobox(page)).toHaveValue("avocado");
  expect(await getSelectionValue(page)).toBe("ocado");
  await page.keyboard.type("o");
  await expect(getCombobox(page)).toHaveValue("avocado");
  expect(await getSelectionValue(page)).toBe("cado");
  await page.keyboard.type("ca");
  await expect(getCombobox(page)).toHaveValue("avocado");
  expect(await getSelectionValue(page)).toBe("do");
});
