import {
  capturePage,
  forEachColorScheme,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ query, test }) => {
  test("keeps single-digit counts square and lets longer counts grow", async ({
    page,
    q,
  }) => {
    await page.evaluate(() => document.fonts.ready);
    for (const title of ["Counts", "Count sizes"]) {
      const labels = query(q.article(title)).text(/^\d+$/);
      await test.expect(labels).toHaveCount(3);
      for (const label of await labels.all()) {
        await test.expect
          .poll(() =>
            label.evaluate((element) => {
              const badge = element.parentElement;
              if (!badge) {
                throw new Error("Badge not found");
              }
              const { width, height } = badge.getBoundingClientRect();
              if ((element.textContent?.length ?? 0) > 1) return width > height;
              return Math.abs(width - height) < 1;
            }),
          )
          .toBe(true);
      }
    }
  });

  test("uses more side padding for pills and keeps explicit padding", async ({
    q,
  }) => {
    const labels = query(q.article("Shape padding")).text("New");
    await test.expect(labels).toHaveCount(3);
    await test.expect
      .poll(() =>
        labels.evaluateAll((elements) => {
          const padding = elements.map((element) => {
            const badge = element.parentElement;
            if (!badge) {
              throw new Error("Badge not found");
            }
            return Number.parseFloat(
              getComputedStyle(badge).paddingInlineStart,
            );
          });
          const [pill, tag, compact] = padding;
          if (pill == null) return false;
          if (tag == null) return false;
          if (compact == null) return false;
          return pill > tag && tag === compact;
        }),
      )
      .toBe(true);
  });

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
