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
  "shows the numbered steps at rest": {
    "numbered-steps": "Numbered steps",
    "numbered-steps-diagonal": "Numbered steps, diagonal",
    "numbered-steps-rail": "Numbered steps, rail",
    "numbered-steps-gradient": "Numbered steps on a gradient",
    "numbered-steps-indent-only": "Numbered steps, indent only",
    "chapters-indent-only": "Chapters, indent only",
    "right-to-left-numbered-steps": "Right to left, numbered steps",
  },
  "shows the dot steps at rest": {
    "dot-steps": "Dot steps",
    "dot-steps-diagonal": "Dot steps, diagonal",
    "dot-steps-rail": "Dot steps, rail",
    "dot-steps-wide-bar": "Dot steps, wide bar",
    "dot-steps-gradient": "Dot steps on a gradient",
    "right-to-left-dot-steps": "Right to left, dot steps",
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
        // The numbered steps start the article, so their first row is current
        // and the other tables of contents have no visible section.
        await scrollToHeading(page, "numbered-overview");
        const nav = query(q.navigation("Numbered steps"));
        await test
          .expect(nav.link("Overview"))
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

  test("fills the dots that the bar covers @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      await scrollToHeading(page, "dot-install");
      const nav = q.navigation("Dot steps");
      await test
        .expect(query(nav).link("Install"))
        .toHaveAttribute("aria-current", "location");
      await captureInView({
        visual,
        box: nav,
        colorScheme,
        item: `${id}/dot-steps-lit`,
      });
      const rightToLeft = q.navigation("Right to left, dot steps");
      await captureInView({
        visual,
        box: rightToLeft,
        colorScheme,
        item: `${id}/right-to-left-dot-steps-lit`,
      });
    });
  });

  test("keeps the dots and their fill in forced colors @visual", async ({
    page,
    q,
    visual,
  }) => {
    // The emulation lasts across the reloads of each color scheme.
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorScheme(page, async (colorScheme) => {
      await expectMedia(page, "(forced-colors: active)");
      await scrollToHeading(page, "dot-install");
      const nav = q.navigation("Dot steps");
      await test
        .expect(query(nav).link("Install"))
        .toHaveAttribute("aria-current", "location");
      await captureInView({
        visual,
        box: nav,
        colorScheme,
        item: `${id}/dot-steps-forced-colors`,
      });
    });
  });
});
