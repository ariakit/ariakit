import {
  captureInView,
  forEachColorScheme,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

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
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorScheme(page, async (colorScheme) => {
      for (const [key, title, tab = "Usage"] of [
        ["edgeless", "Edgeless"],
        ["flat-tabs", "Flat tabs"],
        ["bevel-tabs", "Bevel tabs"],
        ["borderless-flat-tabs", "Borderless flat tabs"],
        ["borderless-bevel-tabs", "Borderless bevel tabs"],
        ["without-outer-edge", "Without outer edge"],
        // The selected first folder meets the panel on the hidden root edge.
        ["without-outer-edge-first-tab", "Without outer edge", "Preview"],
        [
          "darkened-strip-without-outer-edge",
          "Darkened strip without outer edge",
        ],
      ] as const) {
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
});
