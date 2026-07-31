import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/pull/6985
  test("keeps the page in place while the popup is being positioned", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Branch");
    // Counts hidden elements so a popup that stays mounted while closed is
    // still found.
    const search = q.combobox("Search branches", { includeHidden: true });
    const selected = q.option("fabric-focus-blur");

    await test.expect(select).toBeVisible();
    // The composite element is the combobox inside the popup, and the popup is
    // unmounted while closed, so it doesn't exist yet. Both halves matter: if
    // it were rendered next to the select instead, the redirect would still
    // run, but it would target an element outside the popup and go through the
    // silent path, so it couldn't move the page.
    await test.expect(search).toHaveCount(0);

    await select.scrollIntoViewIfNeeded();
    const scrollY = await page.evaluate(() => window.scrollY);
    test.expect(scrollY).toBeGreaterThan(0);

    await select.click();

    // Virtual focus: DOM focus lands on the combobox element inside the popup
    // while the selected item stays the active item.
    await test.expect(search).toBeFocused();
    await test.expect(selected).toHaveAttribute("data-active-item");
    // Only the document scroll is preserved. The popup's own scroller still
    // moves to present the selected item.
    await test.expect(selected).toBeInViewport();

    // Read the scroll position once instead of retrying. The fix restores the
    // document scroll synchronously, before paint, so the page never moves for
    // the user. A retrying assertion would also accept a correction that lands
    // later, which is visible as a jump.
    test.expect(await page.evaluate(() => window.scrollY)).toBe(scrollY);
  });
});
