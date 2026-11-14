import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

// The hover box is presentation with aria-hidden, so it has no accessible name.
// This probe reads it from the DOM and compares it with the box of the hovered
// item. It returns null while the hover box is hidden.
function getHoverBoxOffset(item: Locator) {
  return item.evaluate((element) => {
    const control = element.closest(".control");
    const group = control?.closest(".glider-group");
    const box = group?.querySelector(".glider-box.ui-hovered");
    if (!control || !box) return Number.POSITIVE_INFINITY;
    if (box.closest(".glider-track[data-hidden]")) return null;
    const itemRect = control.getBoundingClientRect();
    const boxRect = box.getBoundingClientRect();
    return Math.max(
      Math.abs(itemRect.left - boxRect.left),
      Math.abs(itemRect.top - boxRect.top),
      Math.abs(itemRect.width - boxRect.width),
      Math.abs(itemRect.height - boxRect.height),
    );
  });
}

withFramework(import.meta.dirname, async ({ query, test }) => {
  // WebKit can send a mousemove after a scroll under a resting pointer, so this
  // hover test runs in Chrome and Firefox only.
  test("moves the hover box to the hovered item", async ({ page, q }) => {
    const box = query(q.article("Hover glider"));
    const grid = box.radio("Grid");
    const board = box.radio("Board");
    await grid.scrollIntoViewIfNeeded();
    await grid.hover();
    await test.expect.poll(() => getHoverBoxOffset(grid)).toBeLessThan(0.5);
    await board.hover();
    await test.expect.poll(() => getHoverBoxOffset(board)).toBeLessThan(0.5);
    await page.mouse.move(0, 0);
    await test.expect.poll(() => getHoverBoxOffset(board)).toBeNull();
  });

  test("starts the hover box on the item under the pointer", async ({
    page,
    q,
  }) => {
    const hydrated = q.checkbox(/^Hydrated/);
    await hydrated.uncheck();
    const box = query(q.article("Hover glider"));
    const grid = box.radio("Grid");
    await grid.scrollIntoViewIfNeeded();
    await grid.hover();
    // The keyboard turns the glider on, so the pointer stays over Grid and
    // sends no new pointerover event.
    await hydrated.focus();
    await page.keyboard.press("Space");
    await test.expect(hydrated).toBeChecked();
    await test.expect.poll(() => getHoverBoxOffset(grid)).toBeLessThan(0.5);
  });
});
