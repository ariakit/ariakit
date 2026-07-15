import { withFramework } from "#app/test-utils/preview.ts";

// Reproduces https://github.com/ariakit/ariakit/issues/4345
withFramework(import.meta.dirname, async ({ test }) => {
  test("locks the page scroll and preserves the html inline overflow-y", async ({
    page,
    q,
  }) => {
    const getHtmlStyle = () =>
      page.evaluate(() => document.documentElement.getAttribute("style") || "");
    const getScrollY = () => page.evaluate(() => window.scrollY);
    await test.expect.poll(getHtmlStyle).toContain("overflow-y: scroll");
    // Scroll down first so the assertions below also cover the lock keeping
    // the current scroll position. The button is sticky, so clicking it won't
    // scroll the page back into view.
    await page.mouse.move(10, 10);
    await page.mouse.wheel(0, 200);
    // Wheel scrolling can be animated (Chromium on Linux), so wait for the
    // scroll position to settle before capturing it.
    let scrollYBeforeOpen = 0;
    await test.expect
      .poll(async () => {
        const previous = scrollYBeforeOpen;
        scrollYBeforeOpen = await getScrollY();
        return previous > 0 && previous === scrollYBeforeOpen;
      })
      .toBe(true);
    await q.button("Show modal").click();
    await test.expect(q.dialog("Dialog")).toBeVisible();
    // The page scrolls through the html element (overflow-y: scroll), so its
    // body overflow doesn't propagate to the viewport. This wheel must be
    // blocked by the html-level lock; a body-only lock wouldn't prevent it.
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(250);
    test.expect(await getScrollY()).toBe(scrollYBeforeOpen);
    await page.keyboard.press("Escape");
    await test.expect(q.dialog("Dialog")).toBeHidden();
    // The lock must restore the html inline style exactly as it was.
    await test.expect.poll(getHtmlStyle).toContain("overflow-y: scroll");
    test.expect(await getHtmlStyle()).not.toContain("hidden");
    test.expect(await getHtmlStyle()).not.toContain("scrollbar-gutter");
    // Focusing the sticky disclosure button on hide scrolls the page to the
    // button's flow position at the top, which is browser focus behavior
    // outside the lock's contract, so assert that the page scrolls again
    // relative to wherever the close landed.
    const scrollYAfterClose = await getScrollY();
    await page.mouse.wheel(0, 300);
    await test.expect.poll(getScrollY).toBeGreaterThan(scrollYAfterClose);
  });
});
