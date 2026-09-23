import {
  capturePage,
  expectMedia,
  forEachColorScheme,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";
import { setVisonautItem } from "#app/test-utils/visonaut.ts";

withCaptures(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7476
  test("keeps marker shapes and guides in forced colors @visual", async ({
    page,
    visual,
  }) => {
    setVisonautItem(
      "ui/list/test-chrome-firefox/keeps-marker-shapes-and-guides-in-forced-colors",
    );
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorScheme(page, async (colorScheme) => {
      await expectMedia(page, "(forced-colors: active)");
      await capturePage(page, visual, colorScheme);
    });
  });
});
