import { invariant } from "@ariakit/utils";
import type { Locator, Page } from "@playwright/test";
import { countAnimations } from "#app/test-utils/ariakit-ui.ts";
import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

// The default hide timeout. Nothing shows a pending hide.
const hideTimeout = 500;

async function getTop(locator: Locator) {
  const box = await locator.boundingBox();
  return box?.y ?? null;
}

withFramework(import.meta.dirname, async ({ test, query }) => {
  // A hovercard scales in when it opens. Playwright retries a hover on an
  // element that moves and scrolls the page before each retry, and a scroll
  // resets Ariakit's hover intent and mouse movement state. A frame that loads
  // after the page, such as a nested frame or a frame in a portal, can't set
  // that state again. So the mouse moves inside a hovercard after it settles.
  const waitForOpen = async (card: Locator) => {
    await test.expect(card).toBeVisible();
    await test.expect.poll(() => countAnimations(card)).toBe(0);
  };

  // Moves the mouse to the empty page beside the hovercards, on the side that
  // has room in the viewport. A point off screen would get no mouse move.
  const moveBeside = async (page: Page, ...cards: Locator[]) => {
    const boxes = await Promise.all(cards.map((card) => card.boundingBox()));
    const [firstBox] = boxes;
    const viewport = page.viewportSize();
    invariant(firstBox, "The hovercard has no bounding box.");
    invariant(viewport, "The page has no viewport size.");
    const left = Math.min(...boxes.map((cardBox) => cardBox?.x ?? Infinity));
    const right = Math.max(
      ...boxes.map((cardBox) => (cardBox ? cardBox.x + cardBox.width : 0)),
    );
    const x = right + 40 < viewport.width ? right + 40 : left - 40;
    invariant(x > 0, "There's no room beside the hovercards.");
    const y = firstBox.y + firstBox.height / 2;
    await page.mouse.move(x, y, { steps: 5 });
  };

  // Scrolls the sidebar by script until the anchor is out of view. A scroll by
  // script doesn't move the mouse, though WebKit then sends a mousemove where
  // the mouse rests, which could hide a hovercard only after the hide timeout.
  // The hovercard follows its anchor on scroll, and the hidden anchor check
  // runs in that same position update, so this waits until the card moves.
  const scrollAnchorOut = async (
    sidebar: Locator,
    anchor: Locator,
    card: Locator,
  ) => {
    const cardTop = await getTop(card);
    await sidebar.evaluate((element) => element.scrollBy({ top: 200 }));
    await test.expect(anchor).not.toBeInViewport();
    await test.expect.poll(() => getTop(card)).not.toBe(cardTop);
  };

  // https://github.com/ariakit/ariakit/issues/8379
  test("keep the hovercard open while the mouse moves in a frame inside it", async ({
    page,
    q,
  }) => {
    const card = q.dialog("Button");
    const preview = query(page.frameLocator("iframe[title='Button preview']"));
    await q.link("Button").hover();
    await waitForOpen(card);
    // A real mouse crosses the hovercard before it enters the frame.
    await query(card).heading("Button").hover();
    await preview.button("Preview button").hover();
    await preview.text("Section 1", { exact: true }).hover();
    // A mouse move outside the hovercard hides it after the hide timeout, which
    // nothing shows while it's pending.
    await page.waitForTimeout(hideTimeout);
    await test.expect(card).toHaveAttribute("data-open");
  });

  // https://github.com/ariakit/ariakit/issues/8379
  test("keep the hovercard open while the mouse moves in a nested frame inside it", async ({
    page,
    q,
  }) => {
    const card = q.dialog("Button");
    const preview = query(page.frameLocator("iframe[title='Button preview']"));
    const nested = query(
      page
        .frameLocator("iframe[title='Button preview']")
        .frameLocator("iframe[title='Nested preview']"),
    );
    await q.link("Button").hover();
    await waitForOpen(card);
    // A real mouse crosses the hovercard and the outer frame before it enters
    // the nested frame.
    await query(card).heading("Button").hover();
    await preview.button("Preview button").hover();
    await nested.button("Nested button").hover();
    await nested.button("Nested button").hover({ position: { x: 4, y: 4 } });
    // A mouse move outside the hovercard hides it after the hide timeout, which
    // nothing shows while it's pending.
    await page.waitForTimeout(hideTimeout);
    await test.expect(card).toHaveAttribute("data-open");
  });

  // https://github.com/ariakit/ariakit/issues/8379
  test("keep a hovercard open while the mouse moves in a frame inside a nested hovercard", async ({
    page,
    q,
  }) => {
    const card = q.dialog("Overlays");
    const nestedCard = q.dialog("Dialog");
    const preview = query(page.frameLocator("iframe[title='Dialog preview']"));
    await q.link("Overlays").hover();
    await waitForOpen(card);
    await query(card).link("Dialog").hover();
    await waitForOpen(nestedCard);
    // A real mouse crosses the nested hovercard before it enters the frame.
    await query(nestedCard).heading("Dialog").hover();
    await preview.button("Dialog button").hover();
    await preview.button("Dialog button").hover({ position: { x: 4, y: 4 } });
    // A mouse move outside the hovercards hides them after the hide timeout,
    // which nothing shows while it's pending.
    await page.waitForTimeout(hideTimeout);
    await test.expect(card).toHaveAttribute("data-open");
    await test.expect(nestedCard).toHaveAttribute("data-open");
  });

  // https://github.com/ariakit/ariakit/issues/8379
  test("keep the hovercard open while focus is in a frame inside it", async ({
    page,
    q,
  }) => {
    const card = q.dialog("Button");
    const preview = query(page.frameLocator("iframe[title='Button preview']"));
    await q.link("Button").hover();
    await waitForOpen(card);
    await query(card).heading("Button").hover();
    await preview.button("Preview button").click();
    await test.expect(preview.button("Preview button")).toBeFocused();
    await moveBeside(page, card);
    // A mouse move outside the hovercard hides it after the hide timeout, which
    // nothing shows while it's pending.
    await page.waitForTimeout(hideTimeout);
    await test.expect(card).toHaveAttribute("data-open");
  });

  // https://github.com/ariakit/ariakit/issues/8379
  test("keep a hovercard open while focus is in a frame inside a nested hovercard", async ({
    page,
    q,
  }) => {
    const card = q.dialog("Overlays");
    const nestedCard = q.dialog("Dialog");
    const preview = query(page.frameLocator("iframe[title='Dialog preview']"));
    await q.link("Overlays").hover();
    await waitForOpen(card);
    await query(card).link("Dialog").hover();
    await waitForOpen(nestedCard);
    await query(nestedCard).heading("Dialog").hover();
    await preview.button("Dialog button").click();
    await test.expect(preview.button("Dialog button")).toBeFocused();
    await moveBeside(page, card, nestedCard);
    // A mouse move outside the hovercards hides them after the hide timeout,
    // which nothing shows while it's pending.
    await page.waitForTimeout(hideTimeout);
    await test.expect(card).toHaveAttribute("data-open");
    await test.expect(nestedCard).toHaveAttribute("data-open");
  });

  // https://github.com/ariakit/ariakit/issues/8379
  test("keep the hovercard open when its anchor scrolls out of view while focus is in a frame inside it", async ({
    page,
    q,
  }) => {
    const anchor = q.link("Docs");
    const card = q.dialog("Docs");
    const preview = query(page.frameLocator("iframe[title='Docs preview']"));
    await anchor.hover();
    await waitForOpen(card);
    await query(card).heading("Docs").hover();
    await preview.button("Docs button").click();
    await test.expect(preview.button("Docs button")).toBeFocused();
    await scrollAnchorOut(q.region("Sidebar"), anchor, card);
    // A close would render in the frame after that position update, and nothing
    // else shows that it didn't happen.
    await flushFrames(page);
    await test.expect(card).toHaveAttribute("data-open");
  });

  // https://github.com/ariakit/ariakit/issues/8379
  test("keep a hovercard open when its anchor scrolls out of view while focus is in a frame inside a nested hovercard", async ({
    page,
    q,
  }) => {
    const anchor = q.link("Docs");
    const card = q.dialog("Docs");
    const nestedCard = q.dialog("Guides");
    const preview = query(page.frameLocator("iframe[title='Guides preview']"));
    await anchor.hover();
    await waitForOpen(card);
    await query(card).link("Guides").hover();
    await waitForOpen(nestedCard);
    await query(nestedCard).heading("Guides").hover();
    await preview.button("Guides button").click();
    await test.expect(preview.button("Guides button")).toBeFocused();
    await scrollAnchorOut(q.region("Sidebar"), anchor, card);
    // A close would render in the frame after that position update, and nothing
    // else shows that it didn't happen.
    await flushFrames(page);
    await test.expect(card).toHaveAttribute("data-open");
  });

  // https://github.com/ariakit/ariakit/issues/8379
  test("hide the hovercard when the mouse moves in a frame outside it", async ({
    page,
    q,
  }) => {
    const card = q.dialog("Button");
    const outside = query(page.frameLocator("iframe[title='Outside preview']"));
    await q.link("Button").hover();
    await waitForOpen(card);
    await query(card).heading("Button").hover();
    await outside.button("Outside button").hover();
    await test.expect(card).toBeHidden();
  });
});
