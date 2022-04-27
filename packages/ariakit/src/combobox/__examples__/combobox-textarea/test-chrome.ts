import { expect, test } from "@playwright/test";

test("popover is rendered correctly", async ({ page }) => {
  await page.goto("/examples/combobox-textarea");
  const textarea = await page.locator("role=combobox[name='Comment']");
  await textarea.click({ position: { x: 10, y: 10 } });
  await textarea.type("Hello @a");
  const popover = await page.locator(".popover[role='listbox']");
  await expect(popover).toBeVisible();
  expect(await popover.boundingBox()).toEqual({
    x: 514,
    y: 337,
    width: 180,
    height: 186,
  });
  await textarea.type("\n\n\n\n\n\n\n\n\n\n");
  await textarea.press("ArrowUp");
  await textarea.press("ArrowUp");
  await textarea.press("ArrowUp");
  await textarea.press("ArrowUp");
  await textarea.type("@");
  expect(await popover.boundingBox()).toEqual({
    x: 472,
    y: 348,
    width: 180,
    height: 186,
  });
  await page.mouse.wheel(0, -50);
  await page.waitForFunction(
    (textarea) => textarea?.scrollTop === 59,
    await textarea.elementHandle()
  );
  await expect(await popover.boundingBox()).toEqual({
    x: 472,
    y: 398,
    width: 180,
    height: 186,
  });
});
