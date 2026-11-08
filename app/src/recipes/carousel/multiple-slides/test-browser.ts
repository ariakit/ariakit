import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  // Fractional slide widths can leave a slide that shows whole a fraction of a
  // pixel past the space between the fades, and a scroll for it would move the
  // row past slides that already show.
  test("keeps the row still for a button in a slide that already shows", async ({
    page,
    q,
  }) => {
    const carousel = q.region("Templates");
    const slides = query(carousel).group();
    const buttons = query(carousel).button("Use template");
    const getScrollLeft = () =>
      slides
        .first()
        .evaluate((node) => node.parentElement?.scrollLeft ?? Number.NaN);
    await buttons.first().focus();
    // The first three slides show whole at the default width.
    for (let index = 1; index < 3; index++) {
      await page.keyboard.press("Tab");
      await test.expect(buttons.nth(index)).toBeFocused();
      test.expect(await getScrollLeft()).toBe(0);
    }
  });
});
