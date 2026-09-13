import {
  captureInView,
  forEachColorScheme,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ query, test }) => {
  // https://github.com/ariakit/ariakit/issues/7476
  // https://github.com/ariakit/ariakit/pull/7500#discussion_r3997271869
  test("keeps badge boundaries in forced colors @visual", async ({
    page,
    q,
    visual,
  }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorScheme(page, async (colorScheme) => {
      for (const [title, label] of [
        ["Default", "Draft"],
        ["Brand", "Beta"],
      ] as const) {
        const box = q.article(title);
        const text = query(box).text(label);
        await test.expect(text).toBeVisible();
        // The label is inside the badge frame whose edge surrounds it.
        await test.expect
          .poll(() =>
            text.evaluate((element) => {
              const badge = element.closest(".control");
              if (!badge) throw new Error("Badge frame not found");
              return getComputedStyle(badge).borderTopWidth;
            }),
          )
          .toBe("1px");
        await captureInView(visual, box, colorScheme, { id: title });
      }
    });
  });
});
