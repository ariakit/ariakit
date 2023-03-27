import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/previews/combobox-textarea");
});

test("popover is positioned correctly", async ({ page }, testInfo) => {
  testInfo.snapshotSuffix = "";
  const textarea = page.getByRole("combobox", { name: "Comment" });
  await textarea.click({ position: { x: 10, y: 10 } });
  await textarea.type("Hello @a");
  const popover = page.locator(".popover[role='listbox']");
  await expect(popover).toBeVisible();
  expect(await page.screenshot()).toMatchSnapshot();
  await textarea.type("\n\n\n\n\n\n\n\n\n\n");
  await textarea.press("ArrowUp");
  await textarea.press("ArrowUp");
  await textarea.press("ArrowUp");
  await textarea.press("ArrowUp");
  await textarea.type("@");
  expect(await page.screenshot()).toMatchSnapshot();
  await page.mouse.wheel(0, -50);
  await page.waitForTimeout(250);
  expect(await page.screenshot()).toMatchSnapshot();
});
