import { withFramework } from "#app/test-utils/preview.ts";
import { recordScrollEvents } from "#app/test-utils/scroll.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // Page scrolling depends on browser layout, so this has no happy-dom
  // duplicate.
  // https://github.com/ariakit/ariakit/issues/7571
  test("keeps the page in place when a submenu with an external store reopens", async ({
    page,
    q,
  }) => {
    const button = q.button("Menu", { exact: true });
    await button.scrollIntoViewIfNeeded();
    await button.focus();
    await page.keyboard.press("Space");
    await test.expect(q.menuitem("Blogs")).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await test.expect(q.menuitem("Alpha")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.menuitem("Bravo")).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await test.expect(q.menuitem("Blogs")).toBeFocused();
    await page.keyboard.press("Escape");
    await test.expect(button).toBeFocused();
    await test.expect(q.menu()).toHaveCount(0);

    const scrollY = await page.evaluate(() => window.scrollY);
    test.expect(scrollY).toBeGreaterThan(0);
    const scroll = await recordScrollEvents(page);

    await page.keyboard.press("Space");
    await test.expect(q.menuitem("Blogs")).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await test.expect(q.menuitem("Alpha")).toBeFocused();
    await test.expect(q.menuitem("Alpha")).toBeInViewport();

    test.expect(await scroll.events()).not.toContain("document");
    test.expect(await page.evaluate(() => window.scrollY)).toBe(scrollY);
  });
});
