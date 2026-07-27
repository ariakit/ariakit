import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

function getSelectionStart(locator: Locator) {
  return locator.evaluate((element) => {
    if (!(element instanceof HTMLInputElement)) return null;
    return element.selectionStart;
  });
}

withFramework(import.meta.dirname, async ({ test }) => {
  test("moves the text cursor without navigating the grid", async ({
    page,
    q,
  }) => {
    const combobox = q.combobox();
    const activeCell = page.locator('[role="gridcell"][data-active-item]');

    await combobox.click();
    await page.keyboard.type("abc");
    await test.expect.poll(() => getSelectionStart(combobox)).toBe(3);

    await page.keyboard.press("ArrowLeft");
    await test.expect.poll(() => getSelectionStart(combobox)).toBe(2);
    await test.expect(activeCell).toHaveCount(0);
    await page.keyboard.press("Home");
    await test.expect.poll(() => getSelectionStart(combobox)).toBe(0);
  });

  test("navigates the grid without moving the text cursor", async ({
    page,
    q,
  }) => {
    const combobox = q.combobox();
    await combobox.click();
    await page.keyboard.type("abc");
    await test.expect.poll(() => getSelectionStart(combobox)).toBe(3);

    await page.keyboard.press("ArrowDown");
    await test
      .expect(q.gridcell("Top Left"))
      .toHaveAttribute("data-active-item");
    await page.keyboard.press("End");
    await test
      .expect(q.gridcell("Top Right"))
      .toHaveAttribute("data-active-item");
    await page.keyboard.press("ArrowLeft");
    await test
      .expect(q.gridcell("Top Center"))
      .toHaveAttribute("data-active-item");
    await test.expect.poll(() => getSelectionStart(combobox)).toBe(3);
  });
});
