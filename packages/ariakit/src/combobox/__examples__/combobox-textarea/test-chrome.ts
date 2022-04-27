import { expect, test } from "@playwright/test";

test("popover is rendered correctly", async ({ page }) => {
  await page.goto("/examples/combobox-textarea");
  const textarea = await page.locator("role=combobox[name='Comment']");
  await textarea.click({ position: { x: 10, y: 10 } });
  await textarea.type("Hello @a");
  const popover = await page.locator(".popover[role='listbox']");
  await expect(popover).toBeVisible();
  let boundingBox = await popover.boundingBox();
  expect(boundingBox).toMatchObject({ width: 180, height: 186, y: 336 });
  expect(boundingBox?.x.toString()).toMatch(/(515|516|517)/);
  await textarea.type("\n\n\n\n\n\n\n\n\n\n");
  await textarea.press("ArrowUp");
  await textarea.press("ArrowUp");
  await textarea.press("ArrowUp");
  await textarea.press("ArrowUp");
  await textarea.type("@");
  boundingBox = await popover.boundingBox();
  expect(boundingBox).toMatchObject({ width: 180, height: 186, y: 346 });
  expect(boundingBox?.x).toBeCloseTo(473);
  expect(boundingBox?.x.toString()).toMatch(/(472|473|474)/);
  await page.mouse.wheel(0, -50);
  await page.waitForTimeout(250);
  boundingBox = await popover.boundingBox();
  expect(boundingBox).toMatchObject({ width: 180, height: 186, y: 396 });
  expect(boundingBox?.x.toString()).toMatch(/(472|473|474)/);
});
