import { expect, test } from "@playwright/test";

test("popover is positioned correctly", async ({ page }) => {
  await page.goto("/examples/combobox-textarea");

  const textarea = await page.locator("role=combobox[name='Comment']");
  await textarea.click({ position: { x: 10, y: 10 } });
  await textarea.type("Hello @a");

  const popover = await page.locator(".popover[role='listbox']");
  await expect(popover).toBeVisible();

  const { x, y } = (await textarea.boundingBox())!;

  expect(await popover.boundingBox()).toEqual({
    width: 180,
    height: 186,
    x: process.platform === "linux" ? x + 65 : x + 66,
    y: y + 34,
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
    x: x + 23,
    y: process.platform === "linux" ? y + 44 : y + 45,
  });

  await page.mouse.wheel(0, -50);
  await page.waitForTimeout(250);

  expect(await popover.boundingBox()).toEqual({
    width: 180,
    height: 186,
    x: x + 23,
    y: process.platform === "linux" ? y + 94 : y + 95,
  });
});
