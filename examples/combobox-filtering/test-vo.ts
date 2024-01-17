import { voiceOverTest as test } from "@guidepup/playwright";
import { expect } from "@playwright/test";

test.beforeEach(async ({ page, voiceOver: vo }) => {
  await page.goto("/previews/combobox-filtering", { waitUntil: "networkidle" });
  await vo.navigateToWebContent();
});

test("navigate through items", async ({ page, voiceOver: vo }) => {
  await vo.next();
  await page.keyboard.press("s");
  await page.keyboard.press("Backspace");
  await page.keyboard.press("s");
  await vo.press("ArrowDown");
  expect(await vo.itemText()).toBe("Salad selected");
  await vo.press("ArrowDown");
  expect(await vo.itemText()).toBe("Sandwich selected");
});
