import {
  captureInView,
  capturePage,
  expectFocusVisible,
  forEachColorScheme,
  forEachColorSchemeOf,
  tabTo,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ query, test }) => {
  test("page @visual", async ({ page, visual }) => {
    await forEachColorScheme(page, (colorScheme) =>
      capturePage({ page, visual, colorScheme, item: "ariakit-ui-link/page" }),
    );
  });

  // https://github.com/ariakit/ariakit/issues/7483
  test("keeps the focus ring against an inline link @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorSchemeOf(page, ["Default"], async (colorScheme) => {
      const box = q.article("Default");
      const link = query(box).link("styling guide");
      await tabTo(page, link);
      await expectFocusVisible(link);
      await captureInView({
        visual,
        box,
        colorScheme,
        item: "ariakit-ui-link/inline-link-focus",
      });
    });
  });

  test("offsets the focus ring of a standalone link @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorSchemeOf(
      page,
      ["Offset focus ring"],
      async (colorScheme) => {
        const box = q.article("Offset focus ring");
        const link = query(box).link("View all");
        await tabTo(page, link);
        await expectFocusVisible(link);
        await captureInView({
          visual,
          box,
          colorScheme,
          item: "ariakit-ui-link/standalone-link-focus",
        });
      },
    );
  });

  test("keeps the new window icon on the line of the last word", async ({
    q,
  }) => {
    const box = q.article("Opens in a new window");
    const link = query(box).link(
      "Read the release notes on the Ariakit website",
    );
    // No state tracks where a line breaks, and only a sweep of widths reaches
    // the one that fits the last word but not the icon. A wrapped icon would
    // add a line to the link that its text does not have.
    const orphanWidths = await link.evaluate((element) => {
      const parent = element.parentElement;
      const text = element.firstChild;
      if (!parent) return [];
      if (!text) return [];
      const range = element.ownerDocument.createRange();
      range.selectNodeContents(text);
      const countLines = (rects: DOMRectList) =>
        new Set(Array.from(rects, (rect) => Math.round(rect.bottom))).size;
      const widths = [];
      for (let width = 40; width <= 320; width += 1) {
        parent.style.maxWidth = `${width}px`;
        if (
          countLines(element.getClientRects()) >
          countLines(range.getClientRects())
        ) {
          widths.push(width);
        }
      }
      return widths;
    });
    test.expect(orphanWidths).toEqual([]);
  });
});
