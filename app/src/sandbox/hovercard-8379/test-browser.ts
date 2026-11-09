import type { Locator } from "@playwright/test";
import { countAnimations } from "#app/test-utils/ariakit-ui.ts";
import { withFramework } from "#app/test-utils/preview.ts";

// The default hide timeout. Nothing shows a pending hide.
const hideTimeout = 500;

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
