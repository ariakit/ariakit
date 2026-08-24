import type { Locator, Page } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

interface PointerDragOptions {
  deltaX: number;
  deltaY: number;
  page: Page;
  target: Locator;
}

async function startPointerDrag({
  deltaX,
  deltaY,
  page,
  target,
}: PointerDragOptions) {
  await target.scrollIntoViewIfNeeded();
  const box = await target.boundingBox();
  if (!box) throw new Error("The swipe target has no bounding box");
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + deltaX, y + deltaY, { steps: 2 });
}

async function dragPointer(options: PointerDragOptions) {
  await startPointerDrag(options);
  await options.page.mouse.up();
}

function getInlineNumber(target: Locator, property: string) {
  return target.evaluate((element, propertyName) => {
    if (!(element instanceof HTMLElement)) {
      throw new Error("The swipe target must be an HTML element");
    }
    return Number.parseFloat(element.style.getPropertyValue(propertyName));
  }, property);
}

withFramework(import.meta.dirname, async ({ test, query }) => {
  // https://github.com/ariakit/ariakit/issues/7235
  test("uses CSS hooks during a short swipe and snaps the card back", async ({
    page,
    q,
  }) => {
    const card = q.alertdialog("Logical end");

    await startPointerDrag({ deltaX: 24, deltaY: 0, page, target: card });

    await test.expect(card).toHaveAttribute("data-swiping", "");
    await test.expect(card).toHaveAttribute("data-swipe-direction", "end");
    await test.expect
      .poll(() => getInlineNumber(card, "--notification-swipe-x"))
      .toBeGreaterThan(20);

    await page.mouse.up();

    await test.expect(card).toBeVisible();
    await test.expect(card).not.toHaveAttribute("data-swiping");
    await test.expect(card).not.toHaveAttribute("data-swipe-direction");
    await test.expect
      .poll(() => getInlineNumber(card, "--notification-swipe-x"))
      .toBe(0);
    await test.expect
      .poll(() => getInlineNumber(card, "--notification-swipe-end-x"))
      .toBeGreaterThan(20);
    await test
      .expect(page.getByLabel("Active notification count"))
      .toHaveText("5");
  });

  // https://github.com/ariakit/ariakit/issues/7235
  test("removes a completed logical swipe and advances focus", async ({
    page,
    q,
  }) => {
    const card = q.alertdialog("Logical end");
    await card.focus();

    await dragPointer({ deltaX: 72, deltaY: 0, page, target: card });

    await test.expect(card).not.toBeVisible();
    await test.expect(q.alertdialog("Vertical lane")).toBeFocused();
    await test
      .expect(page.getByLabel("Active notification count"))
      .toHaveText("4");
  });

  // https://github.com/ariakit/ariakit/issues/7235
  test("supports vertical, all-direction, and RTL logical swipes", async ({
    page,
    q,
  }) => {
    const vertical = q.alertdialog("Vertical lane");
    await dragPointer({ deltaX: 0, deltaY: -72, page, target: vertical });
    await test.expect(vertical).not.toBeVisible();

    const allDirections = q.alertdialog("Any direction");
    await dragPointer({
      deltaX: -72,
      deltaY: 0,
      page,
      target: allDirections,
    });
    await test.expect(allDirections).not.toBeVisible();

    await q.button("Use RTL").click();
    const logical = q.alertdialog("Logical end");
    await test.expect(logical).toHaveAttribute("dir", "rtl");
    await dragPointer({ deltaX: -72, deltaY: 0, page, target: logical });
    await test.expect(logical).not.toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/7235
  test("honors swipe policies and ignores gestures on nested controls", async ({
    page,
    q,
  }) => {
    const touchOnly = q.alertdialog("Touch only");
    await startPointerDrag({
      deltaX: 72,
      deltaY: 0,
      page,
      target: touchOnly,
    });
    await test.expect(touchOnly).not.toHaveAttribute("data-swiping");
    await page.mouse.up();
    await test.expect(touchOnly).toBeVisible();
    await test
      .expect(q.text("The touch callback rejected the mouse drag."))
      .toBeVisible();

    const locked = q.alertdialog("Swipe locked");
    await test.expect(locked).toHaveCSS("touch-action", "auto");
    await test
      .expect(locked)
      .toHaveAttribute("aria-labelledby", "swipe-locked-heading");
    await test.expect(touchOnly).toHaveCSS("touch-action", "pan-y");
    await startPointerDrag({ deltaX: 72, deltaY: 0, page, target: locked });
    await test.expect(locked).not.toHaveAttribute("data-swiping");
    await page.mouse.up();
    await test.expect(locked).toBeVisible();

    const allDirections = q.alertdialog("Any direction");
    const undo = query(allDirections).button("Undo archive");
    await startPointerDrag({ deltaX: 72, deltaY: 0, page, target: undo });
    await test.expect(allDirections).not.toHaveAttribute("data-swiping");
    await page.mouse.up();
    await test.expect(allDirections).toBeVisible();

    await undo.click();
    await test
      .expect(q.text("Undo ran without starting a swipe."))
      .toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/7235
  test("moves focus through dismissals and restores it after the last card", async ({
    page,
    q,
  }) => {
    const headings = [
      "Logical end",
      "Vertical lane",
      "Any direction",
      "Touch only",
      "Swipe locked",
    ];

    for (const [index, heading] of headings.entries()) {
      const card = q.alertdialog(heading);
      await query(card).button(`Dismiss ${heading}`).click();
      const nextHeading = headings[index + 1];
      if (nextHeading) {
        await test.expect(q.alertdialog(nextHeading)).toBeFocused();
      }
    }

    await test.expect(q.alertdialog()).toHaveCount(0);
    await test.expect(q.button("Reset")).toBeFocused();
    await test.expect(q.text("Inbox cleared")).toBeVisible();
    await test
      .expect(page.locator("[data-notifications][hidden]"))
      .not.toHaveAttribute("data-paused");
  });
});
