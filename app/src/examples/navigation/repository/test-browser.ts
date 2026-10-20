import {
  forEachColorScheme,
  getCapture,
  hoverOver,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ id, query, test }) => {
  // Only the bar marks the current tab, so the tab has no selected surface to
  // keep, and hovering it shows the same surface as hovering the other tabs.
  test("shows the hover surface on the current tab @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const nav = q.navigation("Repository");
      const code = query(nav).link("Code");
      await test.expect(code).toHaveAttribute("aria-current", "page");
      await hoverOver(code);
      await visual(
        getCapture(nav, colorScheme, { item: `${id}/current-tab-hover` }),
      );
    });
  });
});
