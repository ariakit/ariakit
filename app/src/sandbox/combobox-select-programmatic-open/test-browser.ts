import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // Taking focus is what moves the page, so a picker that opens outside the
  // viewport is scrolled into view rather than left where the user cannot see
  // the listbox they are now navigating.
  // https://github.com/ariakit/ariakit/issues/7068
  test("scrolls the picker into view when it opens outside the viewport", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Vegetable");
    test.expect(await page.evaluate(() => window.scrollY)).toBe(0);
    await test.expect(select).not.toBeInViewport();

    await page.keyboard.press("F2");

    await test.expect(q.listbox()).toBeVisible();
    await test.expect(select).toBeInViewport();
    test.expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
    await test.expect(select).toBeFocused();
  });
});
