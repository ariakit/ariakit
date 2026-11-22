import {
  captureInView,
  forEachColorSchemeOf,
  getCapture,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

const forcedColorsCaptures = [
  ["edgeless", "Edgeless"],
  ["flat-tabs", "Flat tabs"],
  ["bevel-tabs", "Bevel tabs"],
  ["borderless-flat-tabs", "Borderless flat tabs"],
  ["borderless-bevel-tabs", "Borderless bevel tabs"],
  ["without-outer-edge", "Without outer edge"],
  // The selected first folder meets the panel on the hidden root edge.
  ["without-outer-edge-first-tab", "Without outer edge", "Preview"],
  ["darkened-strip-without-outer-edge", "Darkened strip without outer edge"],
] as const;

withCaptures(import.meta.dirname, async ({ query, test }) => {
  // https://github.com/ariakit/ariakit/pull/7500#discussion_r3997273277
  // https://github.com/ariakit/ariakit/pull/7500#discussion_r4000461790
  // https://github.com/ariakit/ariakit/pull/7500#discussion_r4000913151
  // https://github.com/ariakit/ariakit/issues/7519
  // Forced colors also draw the transparent root edge of `$outerEdge={false}`
  // in the text color.
  test("keeps unselected tabs and hidden outer edges borderless in forced colors @visual", async ({
    page,
    q,
    visual,
  }) => {
    const titles = forcedColorsCaptures.map(([, title]) => title);
    await page.emulateMedia({ forcedColors: "active" });
    // Captures on the full sandbox left the test close to its time budget on
    // slow runners, so only the captured boxes load.
    // https://github.com/ariakit/ariakit/issues/8430
    await forEachColorSchemeOf(page, titles, async (colorScheme) => {
      for (const [key, title, tab = "Usage"] of forcedColorsCaptures) {
        const box = q.article(title);
        const selected = query(box).tab(tab);
        await selected.click();
        await query(box).heading(title).click();
        await test.expect(selected).toHaveAttribute("aria-selected", "true");
        await captureInView({
          visual,
          box,
          colorScheme,
          item: `ariakit-ui-tabs/forced-colors/${key}`,
        });
      }
    });
  });

  // Forced colors drop the shadow that covers the content past the frame of a
  // sticky row and behind its tabs, so the frame keeps that cover in the canvas
  // color.
  // https://github.com/ariakit/ariakit/pull/8553#discussion_r4656810061
  test("keeps the cover of a sticky frame in forced colors @visual", async ({
    page,
    q,
    visual,
  }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorSchemeOf(
      page,
      ["Sticky tab row"],
      async (colorScheme) => {
        const box = q.article("Sticky tab row");
        const area = query(box).group("Sticky tab row scroll area");
        await area.evaluate((node) => {
          node.scrollTo({ top: 90, behavior: "instant" });
        });
        // The first line leaves the scroll area, so the scroll took effect.
        await test
          .expect(query(area).checkbox("Preview line 1"))
          .not.toBeInViewport({ ratio: 1 });
        await visual(
          getCapture(box, colorScheme, {
            item: "ariakit-ui-tabs/forced-colors/sticky-row-scrolled",
          }),
        );
      },
    );
  });
});
