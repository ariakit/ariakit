import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // Composite items are focused with `preventScroll`, so the item is only
  // revealed because the composite scrolls it into view afterwards. Without
  // that, keyboard navigation would silently move focus off screen.
  test("scrolls the page to reveal the item reached with the keyboard", async ({
    page,
    q,
  }) => {
    const near = q.button("Near fruit");
    const distant = q.button("Distant fruit");
    await near.focus();
    await test.expect(near).toBeFocused();
    await test.expect(distant).not.toBeInViewport();
    const scrollY = await page.evaluate(() => window.scrollY);

    await page.keyboard.press("ArrowDown");

    await test.expect(distant).toHaveAttribute("data-active-item");
    await test.expect(distant).toBeFocused();
    await test.expect(distant).toBeInViewport();
    // Pin the movement to the document scroller so a scrollable wrapper added
    // to the fixture later cannot silently satisfy the viewport check instead.
    await test.expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBeGreaterThan(scrollY);
  });

  test("updates focus order through the deprecated prop", async ({
    page,
    q,
  }) => {
    const checkbox = q.checkbox("Include composite element in focus order");
    await checkbox.click();
    await test.expect(checkbox).toBeChecked();

    await q.button("Legacy two").focus();
    await page.keyboard.press("ArrowRight");

    await test.expect(q.toolbar("Legacy focus order")).toBeFocused();
  });
});
