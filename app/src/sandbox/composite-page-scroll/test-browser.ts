import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

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
});
