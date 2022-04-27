import { expect, test } from "@playwright/test";

test("popover is rendered correctly", async ({ page }) => {
  await page.goto("/examples/combobox-textarea");
  const textarea = await page.locator("role=combobox[name='Comment']");
  await textarea.click({ position: { x: 10, y: 10 } });
  await textarea.type("Hello @a");
  const popover = await page.locator(".popover[role='listbox']");
  await expect(popover).toBeVisible();
  expect(await popover.boundingBox()).toEqual({
    width: 180,
    height: 186,
    x: 516,
    y: 336,
  });
  await textarea.type("\n\n\n\n\n\n\n\n\n\n");
  await textarea.press("ArrowUp");
  await textarea.press("ArrowUp");
  await textarea.press("ArrowUp");
  await textarea.press("ArrowUp");
  await textarea.type("@");
  expect(await popover.boundingBox()).toEqual({
    width: 180,
    height: 186,
    x: 473,
    y: 346,
  });
  await page.mouse.wheel(0, -50);
  await page.waitForTimeout(250);
  await expect(await popover.boundingBox()).toEqual({
    width: 180,
    height: 186,
    x: 473,
    y: 396,
  });
});
