import type { Locator, Page } from "@playwright/test";
import { flushFrames, withFramework } from "#app/test-utils/preview.ts";
import { SKIP_TIMEOUT } from "#app/test-utils/tooltip.ts";

// The slide of the shared popup lasts 150 ms.
const SLIDE_DURATION = 150;

/**
 * Moves the pointer onto an anchor. Ariakit resets hover intent on scroll, so
 * the anchor must be in view before the pointer moves over it.
 */
async function hoverAnchor(anchor: Locator) {
  await anchor.scrollIntoViewIfNeeded();
  await anchor.hover();
}

/**
 * Waits for the slides that could start after the popup moves. The count is the
 * visible state, but a slide that must not happen leaves it unchanged, so the
 * wait crosses the frames that start a transition and the slide duration.
 */
async function waitPastSlide(page: Page) {
  await flushFrames(page);
  await page.waitForTimeout(SLIDE_DURATION);
}

withFramework(import.meta.dirname, async ({ query, test }) => {
  test.use({ viewport: { width: 1280, height: 1000 } });

  // https://github.com/ariakit/ariakit/issues/8089
  test("slides the shared popup to the next anchor", async ({ page, q }) => {
    const section = q.region("Slide");
    const one = query(section).button("One");
    const two = query(section).button("Two");
    await hoverAnchor(one);
    const tooltip = q.tooltip("One tooltip");
    await test.expect(tooltip).toBeVisible();
    await waitPastSlide(page);
    // The popup opens in place.
    await test.expect(query(section).status()).toHaveText("Slides: 0");
    await two.hover();
    await test.expect(q.tooltip("Two tooltip")).toBeVisible();
    await test.expect(query(section).status()).not.toHaveText("Slides: 0");
    // The anchors share one popup, which ends centered over the new anchor.
    await test.expect(q.tooltip()).toHaveCount(1);
    await test
      .expect(async () => {
        const anchor = await two.boundingBox();
        const box = await q.tooltip("Two tooltip").boundingBox();
        test.expect(anchor).not.toBeNull();
        test.expect(box).not.toBeNull();
        if (!anchor || !box) return;
        const anchorCenter = anchor.x + anchor.width / 2;
        const boxCenter = box.x + box.width / 2;
        test.expect(Math.abs(anchorCenter - boxCenter)).toBeLessThan(1);
      })
      .toPass();
  });

  test("opens in place again at another anchor", async ({ page, q }) => {
    const section = q.region("Slide");
    await hoverAnchor(query(section).button("One"));
    await test.expect(q.tooltip("One tooltip")).toBeVisible();
    // A corner of the page is clear of the tooltip, so the move doesn't scroll
    // the page under the open tooltip.
    await page.mouse.move(0, 0);
    await test.expect(q.tooltip("One tooltip")).toBeHidden();
    // The next tooltip must open after its show delay, as a new tooltip, so the
    // pointer waits until the previous one is no longer active. The hidden
    // check above already waited for the popup to close.
    await page.waitForTimeout(SKIP_TIMEOUT);
    await hoverAnchor(query(section).button("Three"));
    await test.expect(q.tooltip("Three tooltip")).toBeVisible();
    await waitPastSlide(page);
    await test.expect(query(section).status()).toHaveText("Slides: 0");
  });

  test("doesn't slide with $slide set to false", async ({ page, q }) => {
    const section = q.region("No slide");
    await hoverAnchor(query(section).button("One"));
    await test.expect(q.tooltip("One tooltip")).toBeVisible();
    await query(section).button("Two").hover();
    await test.expect(q.tooltip("Two tooltip")).toBeVisible();
    await waitPastSlide(page);
    await test.expect(query(section).status()).toHaveText("Slides: 0");
  });

  test("doesn't slide with reduced motion", async ({ page, q }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const section = q.region("Slide");
    await hoverAnchor(query(section).button("One"));
    await test.expect(q.tooltip("One tooltip")).toBeVisible();
    await query(section).button("Two").hover();
    await test.expect(q.tooltip("Two tooltip")).toBeVisible();
    await waitPastSlide(page);
    await test.expect(query(section).status()).toHaveText("Slides: 0");
  });

  // Without the popup's own enter animation, Ariakit adds data-enter in the
  // same update as data-open on a reopen, which can let a reopened popup slide
  // from its previous anchor. The first open still waits for the popup to be in
  // place, and a move between anchors still slides.
  test("opens in place without the popup motion", async ({ page, q }) => {
    const section = q.region("No popup motion");
    await hoverAnchor(query(section).button("One"));
    await test.expect(q.tooltip("One tooltip")).toBeVisible();
    // The class removes the motion of the popup.
    await test
      .expect(q.tooltip("One tooltip"))
      .toHaveCSS("transition-property", "none");
    await waitPastSlide(page);
    await test.expect(query(section).status()).toHaveText("Slides: 0");
    await query(section).button("Two").hover();
    await test.expect(q.tooltip("Two tooltip")).toBeVisible();
    await test.expect(query(section).status()).not.toHaveText("Slides: 0");
  });

  test("keeps the popup next to its anchor while a container scrolls", async ({
    page,
    q,
  }) => {
    for (const name of ["Scroll", "Scroll without slide"]) {
      const section = q.region(name);
      const list = query(section).group(`${name} list`);
      const item = query(list).button("Item 2");
      // Keyboard focus keeps the tooltip open while the list scrolls under the
      // pointer.
      await item.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      const tooltip = q.tooltip("Item 2 tooltip");
      await test.expect(tooltip).toBeVisible();
      // The pointer rests on the padding of the list, off the other anchors.
      await list.hover({ position: { x: 2, y: 2 } });
      await page.mouse.wheel(0, 24);
      await test.expect
        .poll(() => list.evaluate((node) => node.scrollTop))
        .toBeGreaterThan(0);
      await test
        .expect(async () => {
          const anchor = await item.boundingBox();
          const box = await tooltip.boundingBox();
          test.expect(anchor).not.toBeNull();
          test.expect(box).not.toBeNull();
          if (!anchor || !box) return;
          const anchorCenter = anchor.y + anchor.height / 2;
          const boxCenter = box.y + box.height / 2;
          test.expect(Math.abs(anchorCenter - boxCenter)).toBeLessThan(1);
        })
        .toPass();
      // With the slide, the popup trails its anchor while the list scrolls.
      if (name === "Scroll without slide") {
        await waitPastSlide(page);
        await test.expect(query(section).status()).toHaveText("Slides: 0");
      }
      await page.keyboard.press("Escape");
      await test.expect(tooltip).toBeHidden();
    }
  });
});
