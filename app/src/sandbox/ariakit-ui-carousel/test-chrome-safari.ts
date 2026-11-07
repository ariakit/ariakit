import type { Locator } from "@playwright/test";
import {
  captureInView,
  forEachColorSchemeOf,
  freezeScrollAnimations,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

// The row buttons show through scroll-driven animations, which the Firefox
// build of Playwright doesn't support yet. The visual job fails a skipped test,
// so the captures of the buttons run only in Chrome and Safari.

async function scrollTo(viewport: Locator, left: number) {
  await viewport.evaluate((node, value) => {
    node.scrollTo({ left: value, behavior: "instant" });
  }, left);
}

withCaptures(import.meta.dirname, async ({ test, query }) => {
  test("fades both ends of a scrolled row behind its buttons @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorSchemeOf(
      page,
      ["Filter row", "Right to left row"],
      async (colorScheme) => {
        for (const name of ["Filter row", "Right to left row"]) {
          const box = q.article(name);
          const viewport = query(box).toolbar();
          await scrollTo(viewport, 150 * (name === "Filter row" ? 1 : -1));
          await test.expect(query(box).button("Scroll backward")).toBeVisible();
        }
        await freezeScrollAnimations(page);
        for (const name of ["Filter row", "Right to left row"]) {
          await captureInView({
            visual,
            box: q.article(name),
            colorScheme,
            item: `ariakit-ui-carousel/scrolled-${name === "Filter row" ? "row" : "rtl-row"}`,
          });
        }
      },
    );
  });
});
