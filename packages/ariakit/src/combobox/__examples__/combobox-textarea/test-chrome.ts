import { expect, test } from "@playwright/test";

test("popup is rendered correctly", async ({ page }) => {
  await page.goto("/examples/combobox-textarea");
  const element = await page.locator("role=combobox[name='Comment']");
  await element.click({ position: { x: 10, y: 10 } });
  await element.type("Hello @a");
  expect(await element.screenshot()).toMatchSnapshot();
  await element.press("Enter");
  await element.press("Enter");
  await element.press("Enter");
  await element.press("Enter");
  await element.press("Enter");
  await element.press("Enter");
  await element.press("Enter");
  await element.press("Enter");
  await element.press("Enter");
  await element.press("Enter");
  await element.press("ArrowUp");
  await element.press("ArrowUp");
  await element.press("ArrowUp");
  await element.press("ArrowUp");
  await element.type("@");
  expect(await element.screenshot()).toMatchSnapshot();
  await page.mouse.wheel(0, -50);
  await page.waitForTimeout(500);
  expect(await element.screenshot()).toMatchSnapshot();
});
