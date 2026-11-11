import {
  forEachColorScheme,
  getCapture,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";
import { withFramework } from "#app/test-utils/preview.ts";

withCaptures(import.meta.dirname, async ({ id, test }) => {
  // The block shows only the edges of the tabs and the code, and the pipe next
  // to the selected tab hides.
  test("shows the file tabs @visual", async ({ page, q, visual }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      await test
        .expect(q.tab("toggle.tsx"))
        .toHaveAttribute("aria-selected", "true");
      await visual(
        getCapture(page.locator(".code-block"), colorScheme, {
          item: `${id}/selected-file`,
        }),
      );
    });
  });
});

withFramework(import.meta.dirname, async ({ test }) => {
  test("keeps the scroll position of each file", async ({ page, q }) => {
    // A narrow viewport makes the long lines of toggle.tsx overflow.
    await page.setViewportSize({ width: 320, height: 600 });
    const panel = q.tabpanel("toggle.tsx");
    await panel.evaluate((element) => element.scrollTo({ left: 80 }));
    await test.expect
      .poll(() => panel.evaluate((element) => element.scrollLeft))
      .toBe(80);
    await q.tab("use-toggle.ts").click();
    await test.expect(q.tabpanel("use-toggle.ts")).toBeVisible();
    await q.tab("toggle.tsx").click();
    await test.expect(panel).toBeVisible();
    await test.expect
      .poll(() => panel.evaluate((element) => element.scrollLeft))
      .toBe(80);
  });
});
