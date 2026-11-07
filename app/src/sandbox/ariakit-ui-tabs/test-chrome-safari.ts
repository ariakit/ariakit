import {
  captureInView,
  forEachColorSchemeOf,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

// The strip fades and buttons show through scroll-driven animations, which the
// Firefox build of Playwright supports only from version 159, so the captures
// of scrolled strips run only in Chrome and Safari, where they started.

withCaptures(import.meta.dirname, async ({ query, test }) => {
  // A scrolled strip fades its tabs behind both scroll buttons, and the panel
  // keeps its round corners, which the fades keep clear. The start corner,
  // square under the selected first tab at rest, opens as that tab fades out.
  test("fades a scrolled strip behind its buttons @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorSchemeOf(
      page,
      ["Overflowing strip"],
      async (colorScheme) => {
        const box = q.article("Overflowing strip");
        const list = query(box).tablist("Overflowing strip");
        await list.evaluate((node) => {
          node.scrollTo({ left: 120, behavior: "instant" });
        });
        await test.expect(query(box).button("Previous tabs")).toBeVisible();
        await test.expect(query(box).button("Next tabs")).toBeVisible();
        await captureInView({
          visual,
          box,
          colorScheme,
          item: "ariakit-ui-tabs/scrolled-strip",
        });
      },
    );
  });

  // Without buttons, as on a touch screen, the fade still keeps the start of
  // the strip clear of the round panel corner, so the selected tab fades out
  // before it reaches the corner.
  test("keeps a strip without buttons clear of the panel corners @visual", async ({
    page,
    q,
    visual,
  }) => {
    const title = "Overflowing strip without buttons";
    await forEachColorSchemeOf(page, [title], async (colorScheme) => {
      const box = q.article(title);
      const list = query(box).tablist(title);
      await test.expect(query(box).button("Previous tabs")).toHaveCount(0);
      // Scroll the start of the selected tab just past the start of the strip,
      // over the panel corner.
      await list.evaluate((node) => {
        const tab = node.querySelector("[aria-selected='true']");
        if (!tab) return;
        const offset =
          tab.getBoundingClientRect().left - node.getBoundingClientRect().left;
        node.scrollBy({ left: offset - 4, behavior: "instant" });
      });
      await test.expect
        .poll(() => list.evaluate((node) => node.scrollLeft))
        .toBeGreaterThan(0);
      await captureInView({
        visual,
        box,
        colorScheme,
        item: "ariakit-ui-tabs/scrolled-strip-without-buttons",
      });
    });
  });
});
