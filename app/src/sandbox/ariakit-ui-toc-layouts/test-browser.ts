import type { Page } from "@playwright/test";
import {
  captureInView,
  expectMedia,
  forEachColorScheme,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

// The tables of contents at rest, in two tests. Without a previous capture,
// each capture takes a second equal one, and all of them in one test exceed the
// budget in Safari.
// https://github.com/ariakit/ariakit/issues/8195
const restingTocs = {
  "shows the guide looks at rest": {
    "five-levels": "Five levels",
    "five-levels-diagonal": "Five levels, diagonal",
    "straight-rail": "Straight rail",
    "indent-only": "Indent only",
    "wide-thumb": "Wide thumb",
  },
  "shows the link styles, the chapters, and right to left at rest": {
    "bold-current-link": "Bold current link",
    "twelve-chapters": "Twelve chapters",
    "marked-parents": "Marked parents",
    "right-to-left": "Right to left",
    "right-to-left-diagonal": "Right to left, diagonal",
  },
};

// Puts a heading where a click on its link would, at the scroll padding.
async function scrollToHeading(page: Page, id: string) {
  await page.evaluate((id) => {
    document.getElementById(id)?.scrollIntoView({ block: "start" });
  }, id);
}

withCaptures(import.meta.dirname, async ({ id, test, query }) => {
  for (const [title, tocs] of Object.entries(restingTocs)) {
    test(`${title} @visual`, async ({ page, q, visual }) => {
      await forEachColorScheme(page, async (colorScheme) => {
        // A row deeper than the third level is current, so its parents are
        // marked, chapter rows have no visible section, and the right to left
        // rows end the article.
        await scrollToHeading(page, "deep-pnpm");
        const nav = query(q.navigation("Five levels"));
        await test
          .expect(nav.link("With pnpm"))
          .toHaveAttribute("aria-current", "location");
        // The tables of contents wrap below the viewport. The headings scroll
        // in their own box, so the window scroll that centers each capture
        // keeps the current heading and the rows on screen.
        for (const [item, name] of Object.entries(tocs)) {
          await captureInView({
            visual,
            box: q.navigation(name),
            colorScheme,
            item: `${id}/${item}`,
          });
        }
      });
    });
  }

  test("lights the ring of a two-digit marker unless rings are off @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      await scrollToHeading(page, "chapter-10");
      const nav = q.navigation("Twelve chapters");
      await test
        .expect(query(nav).link("Chapter 10"))
        .toHaveAttribute("aria-current", "location");
      await captureInView({
        visual,
        box: nav,
        colorScheme,
        item: `${id}/twelve-chapters-lit`,
      });
      // Without rings, the markers sit over the thumb.
      const plain = q.navigation("Numbers over the thumb");
      await test
        .expect(query(plain).link("Chapter 10"))
        .toHaveAttribute("aria-current", "location");
      await captureInView({
        visual,
        box: plain,
        colorScheme,
        item: `${id}/numbers-over-thumb`,
      });
      // The ring takes the width of a thumb wider than the marker halo, which
      // widens the halo to keep the ring off the number.
      const wide = q.navigation("Wide thumb chapters");
      await test
        .expect(query(wide).link("Chapter 10"))
        .toHaveAttribute("aria-current", "location");
      await captureInView({
        visual,
        box: wide,
        colorScheme,
        item: `${id}/wide-thumb-chapters-lit`,
      });
    });
  });

  test("keeps the guide, the thumb, the rings, and the current row in forced colors @visual", async ({
    page,
    q,
    visual,
  }) => {
    // The emulation lasts across the reloads of each color scheme.
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorScheme(page, async (colorScheme) => {
      await expectMedia(page, "(forced-colors: active)");
      await scrollToHeading(page, "rtl-usage");
      const nav = q.navigation("Right to left");
      await test
        .expect(query(nav).link("الاستخدام"))
        .toHaveAttribute("aria-current", "location");
      await captureInView({
        visual,
        box: nav,
        colorScheme,
        item: `${id}/right-to-left-forced-colors`,
      });
    });
  });
});
