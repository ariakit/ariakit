import { invariant } from "@ariakit/utils";
import type { Locator, Page } from "@playwright/test";
import { countAnimations } from "#app/test-utils/ariakit-ui.ts";
import { withFramework } from "#app/test-utils/preview.ts";

// The default hide timeout. Nothing shows a pending hide.
const hideTimeout = 500;

// The time without mouse moves after which the safe area ends, plus a few
// animation frames, where the check runs. Nothing shows that the safe area
// ended.
const restDelay = 50 + 50;

async function getCenter(locator: Locator) {
  const box = await locator.boundingBox();
  invariant(box, "The element has no bounding box.");
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

// Moves the mouse straight down from the first link's center to the vertical
// center of the target. The second link is on the way, between the first link
// and its hovercard.
async function moveDownTo(page: Page, from: Locator, to: Locator) {
  const start = await getCenter(from);
  const end = await getCenter(to);
  await page.mouse.move(start.x, end.y, { steps: 5 });
}

withFramework(import.meta.dirname, async ({ test }) => {
  // A hovercard scales in when it opens, so the mouse moves toward it after it
  // settles.
  const openHovercard = async (anchor: Locator, card: Locator) => {
    await anchor.hover();
    await test.expect(card).toHaveAttribute("data-open");
    await test.expect.poll(() => countAnimations(card)).toBe(0);
  };

  test("a mouse that stops on another link on the way to the hovercard shows that link's hovercard", async ({
    page,
    q,
  }) => {
    const firstLink = q.link("First article");
    const firstCard = q.dialog("First article");
    const secondLink = q.link("Second article");
    const secondCard = q.dialog("Second article");
    await openHovercard(firstLink, firstCard);
    await moveDownTo(page, firstLink, secondLink);
    await test.expect(firstCard).toBeHidden();
    await test.expect(secondCard).toHaveAttribute("data-open");
  });

  test("a short stop on the way to the hovercard keeps it open when the mouse reaches it", async ({
    page,
    q,
  }) => {
    const firstLink = q.link("First article");
    const firstCard = q.dialog("First article");
    const secondLink = q.link("Second article");
    const secondCard = q.dialog("Second article");
    await openHovercard(firstLink, firstCard);
    await moveDownTo(page, firstLink, secondLink);
    // The stop ends the safe area. The hovercard would hide at once if a stop
    // hid it, and no state shows that the safe area ended.
    await page.waitForTimeout(restDelay);
    await test.expect(firstCard).toHaveAttribute("data-open");
    await moveDownTo(page, firstLink, firstCard);
    // The pending hide would hide the hovercard after the hide timeout, and no
    // state shows a pending hide.
    await page.waitForTimeout(hideTimeout + 100);
    await test.expect(firstCard).toHaveAttribute("data-open");
    await test.expect(secondCard).toBeHidden();
  });

  test("a mouse that moves through another link to the hovercard keeps it open", async ({
    page,
    q,
  }) => {
    const firstLink = q.link("First article");
    const firstCard = q.dialog("First article");
    const secondCard = q.dialog("Second article");
    await openHovercard(firstLink, firstCard);
    await moveDownTo(page, firstLink, firstCard);
    // The hovercard would hide after the hide timeout, and no state shows a
    // pending hide.
    await page.waitForTimeout(hideTimeout + 100);
    await test.expect(firstCard).toHaveAttribute("data-open");
    await test.expect(secondCard).toBeHidden();
  });
});
