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

  // Chrome and Firefox show the travel of the box at the time of the last
  // frame, so the glider moves its travels to the time since they started.
  test("keeps the box in its window when the item that it travels to grows", async ({
    q,
  }) => {
    await q.combobox(/^Travel time/).selectOption({ label: "Slow (800ms)" });
    // The box and its window are presentation, so this probe reads them from
    // the DOM. A card shows the badge on Board while the box travels there, so
    // Board grows in its place, and the box gets a new size but no new travel.
    const gaps = await q
      .article("A count that changes")
      .evaluate(async (node) => {
        const board = node.querySelector<HTMLInputElement>(
          'input[value="Board"]',
        );
        const addCard = Array.from(node.querySelectorAll("button")).find(
          (button) => button.textContent === "Add a card",
        );
        const box = node.querySelector('.glider-box[data-selected="true"]');
        const boxWindow = node.querySelector(".glider-window");
        if (!board || !addCard || !box || !boxWindow) return [];
        const afterPaint = () =>
          new Promise((resolve) => {
            requestAnimationFrame(() => setTimeout(resolve));
          });
        board.click();
        for (let frame = 0; frame < 2; frame++) {
          await afterPaint();
        }
        addCard.click();
        const gaps: number[] = [];
        for (let frame = 0; frame < 5; frame++) {
          await afterPaint();
          const boxLeft = box.getBoundingClientRect().left;
          gaps.push(Math.abs(boxLeft - boxWindow.getBoundingClientRect().left));
        }
        return gaps;
      });
    test.expect(gaps).toHaveLength(5);
    test.expect(Math.max(...gaps)).toBeLessThan(1);
  });
});
