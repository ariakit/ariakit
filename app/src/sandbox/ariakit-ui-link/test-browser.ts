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

  test("keeps the new window icon with the last word inside the column", async ({
    q,
  }) => {
    // Text after the link can hide an overflow, so one link has none.
    const links = [
      query(q.article("Opens in a new window")).link(
        "Read the release notes on the Ariakit website",
      ),
      query(q.article("Opens in a new window with no text after it")).link(
        "Read the full changelog on the Ariakit website",
      ),
    ];
    for (const link of links) {
      // No state tracks where a line breaks, and only a sweep of widths reaches
      // the ones that fit the last word but not the icon. A wrapped icon would
      // add a line to the link that its text does not have. An icon that stays
      // on the line without room for it would pass the column edge. The sweep
      // starts above the longest word, so any overflow comes from the icon.
      const result = await link.evaluate((element) => {
        const orphanWidths: number[] = [];
        const overflowWidths: number[] = [];
        const parent = element.parentElement;
        const text = element.firstChild;
        if (!parent) {
          throw new Error("The link has no parent.");
        }
        if (!text) {
          throw new Error("The link has no text.");
        }
        const range = element.ownerDocument.createRange();
        range.selectNodeContents(text);
        const countLines = (rects: DOMRectList) =>
          new Set(Array.from(rects, (rect) => Math.round(rect.bottom))).size;
        const columnLeft = parent.getBoundingClientRect().left;
        for (let width = 80; width <= 320; width += 1) {
          parent.style.width = `${width}px`;
          parent.style.maxWidth = `${width}px`;
          const rects = element.getClientRects();
          if (countLines(rects) > countLines(range.getClientRects())) {
            orphanWidths.push(width);
          }
          const right = Math.max(...Array.from(rects, (rect) => rect.right));
          if (right > columnLeft + width + 0.5) {
            overflowWidths.push(width);
          }
        }
        return { orphanWidths, overflowWidths };
      });
      test.expect(result).toEqual({ orphanWidths: [], overflowWidths: [] });
    }
  });
});
