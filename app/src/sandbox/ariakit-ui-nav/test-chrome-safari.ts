import {
  captureInView,
  forEachColorSchemeOf,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

// The scroll buttons show through scroll-driven animations, which the Firefox
// build of Playwright supports only from version 159, so the captures of the
// buttons run only in Chrome and Safari, like those of the other carousels.

withCaptures(import.meta.dirname, async ({ query, test }) => {
  // The root paints the edge of the navigation, so the edge stays whole while
  // the links and the bar of the current one fade behind the scroll buttons.
  // https://github.com/ariakit/ariakit/issues/8327
  test("fades the links of a scrolled horizontal navigation @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorSchemeOf(
      page,
      ["Horizontal navigation"],
      async (colorScheme) => {
        const nav = q.navigation("Project pages");
        const root = nav.locator("..");
        await nav.evaluate((node) => {
          node.scrollTo({ left: 60, behavior: "instant" });
        });
        await test.expect(query(root).button("Scroll backward")).toBeVisible();
        await test.expect(query(root).button("Scroll forward")).toBeVisible();
        await captureInView({
          visual,
          box: root,
          colorScheme,
          item: "ariakit-ui-nav/scrolled-horizontal",
        });
      },
    );
  });
});
