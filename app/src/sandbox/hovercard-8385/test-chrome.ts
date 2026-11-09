import { invariant } from "@ariakit/utils";
import type { Locator, Page } from "@playwright/test";
import { countAnimations } from "#app/test-utils/ariakit-ui.ts";
import { withFramework } from "#app/test-utils/preview.ts";

// The default hide timeout. Nothing shows a pending hide.
const hideTimeout = 500;

// The maximum size of the notes box in the sandbox.
const notesMaxSize = { width: 320, height: 160 };

async function getSize(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) return null;
  return { width: Math.round(box.width), height: Math.round(box.height) };
}

// Moves the mouse past the bottom-right corner of the hovercards by the
// distance on each axis.
async function moveBeyond(page: Page, cards: Locator[], distance: number) {
  const boxes = await Promise.all(cards.map((card) => card.boundingBox()));
  const right = Math.max(...boxes.map((box) => (box ? box.x + box.width : 0)));
  const bottom = Math.max(
    ...boxes.map((box) => (box ? box.y + box.height : 0)),
  );
  const x = right + distance;
  const y = bottom + distance;
  const viewport = page.viewportSize();
  invariant(viewport, "The page has no viewport size.");
  // A point off screen would get no mouse move.
  invariant(x < viewport.width, "There's no room beside the hovercards.");
  invariant(y < viewport.height, "There's no room below the hovercards.");
  await page.mouse.move(x, y, { steps: 10 });
}

withFramework(import.meta.dirname, async ({ test, query }) => {
  // A hovercard scales in when it opens, and Playwright retries a hover on an
  // element that moves, so the mouse moves inside a hovercard after it settles.
  const openHovercard = async (anchor: Locator, card: Locator) => {
    await anchor.scrollIntoViewIfNeeded();
    await anchor.hover();
    await test.expect(card).toHaveAttribute("data-open");
    await test.expect.poll(() => countAnimations(card)).toBe(0);
  };

  // Presses the mouse button on the resize grip in the bottom-right corner of
  // the box. The press doesn't move focus.
  const pressResizeGrip = async (page: Page, box: Locator) => {
    const rect = await box.boundingBox();
    invariant(rect, "The box has no bounding box.");
    await page.mouse.move(rect.x + rect.width - 3, rect.y + rect.height - 3, {
      steps: 5,
    });
    await page.mouse.down();
  };

  // https://github.com/ariakit/ariakit/issues/8385
  test("keep the hovercard open while a drag on a resize grip inside it goes past its edge", async ({
    page,
    q,
  }) => {
    const card = q.dialog("Profile");
    await openHovercard(q.link("Profile"), card);
    const notes = query(card).region("Notes");
    await pressResizeGrip(page, notes);
    // The box grows the hovercard by 64px on each axis on the way.
    await moveBeyond(page, [card], 120);
    // The box stops at its maximum size, so the mouse is past the hovercard.
    await test.expect.poll(() => getSize(notes)).toEqual(notesMaxSize);
    // A mouse move outside the hovercard hides it after the hide timeout, which
    // nothing shows while it's pending.
    await page.waitForTimeout(hideTimeout);
    await test.expect(card).toHaveAttribute("data-open");
    await page.mouse.up();
    await moveBeyond(page, [card], 40);
    await test.expect(card).toBeHidden();
  });

  // https://github.com/ariakit/ariakit/issues/8385
  test("keep the hovercards open while a drag on a resize grip inside a nested hovercard goes past their edges", async ({
    page,
    q,
  }) => {
    const card = q.dialog("Team");
    const nestedCard = q.dialog("Member");
    await openHovercard(q.link("Team"), card);
    await openHovercard(query(card).link("Member"), nestedCard);
    const notes = query(nestedCard).region("Notes");
    await pressResizeGrip(page, notes);
    // The box grows the nested hovercard by 64px on each axis on the way.
    await moveBeyond(page, [card, nestedCard], 120);
    // The box stops at its maximum size, so the mouse is past the hovercards.
    await test.expect.poll(() => getSize(notes)).toEqual(notesMaxSize);
    // A mouse move outside the hovercards hides them after the hide timeout,
    // which nothing shows while it's pending.
    await page.waitForTimeout(hideTimeout);
    await test.expect(nestedCard).toHaveAttribute("data-open");
    await test.expect(card).toHaveAttribute("data-open");
    await page.mouse.up();
    await moveBeyond(page, [card, nestedCard], 40);
    await test.expect(nestedCard).toBeHidden();
    await test.expect(card).toBeHidden();
  });

  // https://github.com/ariakit/ariakit/issues/8385
  test("hide the hovercard while a press that started outside it lasts", async ({
    page,
    q,
  }) => {
    const card = q.dialog("Profile");
    await openHovercard(q.link("Profile"), card);
    await moveBeyond(page, [card], 40);
    await page.mouse.down();
    await moveBeyond(page, [card], 80);
    await test.expect(card).toBeHidden();
    await page.mouse.up();
  });
});
