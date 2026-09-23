import {
  captureInView,
  forEachColorScheme,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";
import { setVisonautItem } from "#app/test-utils/visonaut.ts";

withCaptures(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7476
  // https://github.com/ariakit/ariakit/pull/7500#discussion_r3997271869
  test("keeps badge boundaries in forced colors @visual", async ({
    page,
    q,
    visual,
  }) => {
    setVisonautItem(
      "ui/badge/test-chrome-firefox/keeps-badge-boundaries-in-forced-colors",
    );
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorScheme(page, async (colorScheme) => {
      for (const title of ["Default", "Brand"]) {
        const box = q.article(title);
        await captureInView(visual, box, colorScheme, { id: title });
      }
    });
  });
});
