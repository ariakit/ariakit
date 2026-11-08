import type { query as getQuery } from "@ariakit/test/playwright";
import { slugify } from "#app/lib/string.ts";
import {
  captureInView,
  forEachColorSchemeOf,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

// The scroll buttons show through scroll-driven animations, which the Firefox
// build of Playwright supports only from version 159, so the captures of the
// buttons run only in Chrome and Safari, like those of the other carousels.

type Query = ReturnType<typeof getQuery>;

const examples = [
  {
    title: "Narrow",
    getGroup: (q: Query) => q.radiogroup("Narrow"),
    buttons: ["Scroll backward", "Scroll forward"],
  },
  {
    title: "Narrow tabs",
    getGroup: (q: Query) => q.tablist("Narrow period"),
    buttons: ["Previous tabs", "Next tabs"],
  },
  {
    title: "Narrow buttons",
    getGroup: (q: Query) => q.group("Narrow pages"),
    buttons: ["Scroll backward", "Scroll forward"],
  },
  {
    title: "Narrow navigation",
    getGroup: (q: Query) => q.navigation("Narrow range"),
    buttons: ["Scroll backward", "Scroll forward"],
  },
];

const titles = examples.map((example) => example.title);

withCaptures(import.meta.dirname, async ({ query, test }) => {
  // The root paints the surface of each group, so the surface stays whole while
  // the segments fade behind both scroll buttons.
  // https://github.com/ariakit/ariakit/issues/8325
  // https://github.com/ariakit/ariakit/issues/8326
  // https://github.com/ariakit/ariakit/issues/8327
  test("fades scrolled groups behind their buttons @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorSchemeOf(page, titles, async (colorScheme) => {
      for (const { title, getGroup, buttons } of examples) {
        const box = query(q.article(title));
        await getGroup(q).evaluate((node) => {
          node.scrollTo({ left: 24, behavior: "instant" });
        });
        for (const button of buttons) {
          await test.expect(box.button(button)).toBeVisible();
        }
      }
      for (const title of titles) {
        await captureInView({
          visual,
          box: q.article(title),
          colorScheme,
          item: `ariakit-ui-segmented-control/scrolled-${slugify(title)}`,
        });
      }
    });
  });
});
