import type { Locator } from "@playwright/test";
import { flushFrames, withFramework } from "#app/test-utils/preview.ts";
import { recordScrollEvents } from "#app/test-utils/scroll.ts";

/**
 * Focuses without letting the browser scroll the element into view, so the only
 * page movement a test can observe is the one the composite performs.
 */
function focusWithoutScrolling(locator: Locator) {
  return locator.evaluate((element) => {
    if (element instanceof HTMLElement) {
      element.focus({ preventScroll: true });
    }
  });
}

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/6986
  test("scrolls the page to present the active item of an inline composite", async ({
    page,
    q,
  }) => {
    const composite = q.listbox("Actions");
    const item = q.option("Item 30");

    // Focus starts outside so focusing the composite fires a focus event.
    await q.button("Outside").focus();
    await page.evaluate(() => window.scrollTo({ top: 0 }));
    await test.expect(item).not.toBeInViewport();

    await focusWithoutScrolling(composite);

    // Virtual focus keeps DOM focus on the composite element, but the item
    // marked as the presentation target still has to be brought into view, and
    // there is no scrollport here other than the page.
    await test.expect(composite).toBeFocused();
    await test.expect(item).toHaveAttribute("data-active-item");
    await test.expect(item).toBeInViewport();
    test.expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  });

  // https://github.com/ariakit/ariakit/issues/6986
  test("scrolls the page while navigating an inline composite", async ({
    page,
    q,
  }) => {
    const composite = q.listbox("Actions");
    const last = q.option("Item 30");
    const first = q.option("Item 1");

    // Start from the active item already in view, so this covers navigation
    // rather than the presentation that happens when focus arrives.
    await q.button("Outside").focus();
    await last.scrollIntoViewIfNeeded();
    await focusWithoutScrolling(composite);
    await test.expect(composite).toBeFocused();
    await test.expect(first).not.toBeInViewport();

    await page.keyboard.press("Home");

    await test.expect(first).toHaveAttribute("data-active-item");
    await test.expect(first).toBeInViewport();
  });

  // `move(null)` targets the composite element, but an unfocusable one never
  // receives focus, so scrolling to it moves the page for nothing. That is the
  // movement this change replaces rather than emulates.
  test("does not scroll to a composite that cannot take focus", async ({
    page,
    q,
  }) => {
    const trigger = q.button("Move to unfocusable composite");
    // The neighbouring composite presents its marked item on mount, which
    // leaves the page scrolled. Reset first so this test measures only its own
    // interaction.
    await page.evaluate(() => window.scrollTo({ top: 0 }));
    await test.expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    // The trigger sits above the fold and the composite well below it, so the
    // harness never has to scroll to click, and any movement is the library's.
    await test.expect(trigger).toBeInViewport({ ratio: 1 });
    await test.expect(q.listbox("Unfocusable actions")).not.toBeInViewport();
    const scroll = await recordScrollEvents(page);

    await trigger.click();

    await flushFrames(page);
    test.expect(await page.evaluate(() => window.scrollY)).toBe(0);
    test.expect(await scroll.events()).not.toContain("document");
  });
});
