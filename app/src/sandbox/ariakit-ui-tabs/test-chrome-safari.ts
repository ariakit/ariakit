import {
  captureInView,
  forEachColorSchemeOf,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

// The strip buttons show through scroll-driven animations, which the Firefox
// build of Playwright supports only from version 159, so the captures of the
// buttons run only in Chrome and Safari, where they started.

withCaptures(import.meta.dirname, async ({ query, test }) => {
  // A scrolled strip fades its tabs behind both scroll buttons, and the panel
  // squares its corners under the tabs that pass its edges.
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
});
