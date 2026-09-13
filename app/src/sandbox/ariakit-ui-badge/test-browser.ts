import {
  capturePage,
  forEachColorScheme,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ query, test }) => {
  // https://github.com/ariakit/ariakit/issues/7475
  test("fits two wide initials inside an avatar slot", async ({ q }) => {
    const initials = query(q.article("Avatar")).text("WW");
    await test.expect(initials).toBeVisible();
    await test.expect
      .poll(() =>
        initials.evaluate((element) => {
          const slot = element.closest(".overflow-clip");
          if (!slot) throw new Error("Avatar slot not found");
          const range = document.createRange();
          range.selectNodeContents(element);
          const text = range.getBoundingClientRect();
          const bounds = slot.getBoundingClientRect();
          return (
            Math.abs(bounds.width - bounds.height) < 1 &&
            text.left >= bounds.left &&
            text.right <= bounds.right
          );
        }),
      )
      .toBe(true);
  });

  test("page @visual", async ({ page, visual }) => {
    await forEachColorScheme(page, (colorScheme) =>
      capturePage(page, visual, colorScheme),
    );
  });
});
