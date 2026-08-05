import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/pull/6832
  test("does not scroll with smooth scrolling", async ({ page, q }) => {
    await q.combobox("Favorite fruit").focus();
    await page.evaluate(() =>
      window.scrollTo({ top: 100, behavior: "instant" }),
    );
    await test.expect.poll(() => page.evaluate(() => window.scrollY)).toBe(100);
    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = "smooth";
      const scrollY = window.scrollY;
      window.addEventListener("scroll", () => {
        if (window.scrollY === scrollY) return;
        document.documentElement.dataset.scrollMoved = "true";
      });
    });

    await page.keyboard.press("Enter");

    await test.expect(q.listbox("Favorite fruit")).toBeVisible();
    // A prevented scroll has no positive completion state, so wait through the
    // pending presentation callback and Safari's smooth-scroll checkpoint.
    await flushFrames(page, 2);
    test
      .expect(
        await page.evaluate(() => document.documentElement.dataset.scrollMoved),
      )
      .toBeUndefined();
    test.expect(await page.evaluate(() => window.scrollY)).toBe(100);
  });
});
