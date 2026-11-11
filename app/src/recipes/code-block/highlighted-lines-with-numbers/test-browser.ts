import type { Locator } from "@playwright/test";
import {
  expectMedia,
  forEachColorScheme,
  getCapture,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ id, test }) => {
  // The gutter covers the code that scrolls under it.
  const scrollSideways = async (code: Locator) => {
    await code.evaluate((element) => element.scrollTo({ left: 160 }));
    await test.expect
      .poll(() => code.evaluate((element) => element.scrollLeft))
      .toBe(160);
  };

  // The gutter keeps the bar of each marked line.
  test("shows the marks under the line numbers @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      await scrollSideways(q.region("fetch-users.ts"));
      await visual(
        getCapture(page.locator(".code-block"), colorScheme, {
          item: `${id}/scrolled`,
        }),
      );
    });
  });

  // High contrast adds dotted edges at the top and the bottom of each run of
  // marked lines, over the gutter too.
  test("shows the edges of marked runs in high contrast @visual", async ({
    page,
    q,
    visual,
  }) => {
    await page.emulateMedia({ contrast: "more" });
    await forEachColorScheme(page, async (colorScheme) => {
      await expectMedia(page, "(prefers-contrast: more)");
      await scrollSideways(q.region("fetch-users.ts"));
      await visual(
        getCapture(page.locator(".code-block"), colorScheme, {
          item: `${id}/scrolled`,
        }),
      );
    });
  });

  // The code is always left to right, so on a right-to-left page the copy
  // button stays on its right, clear of the first line and its number.
  test("keeps the copy button on the right of the code on a right-to-left page @visual", async ({
    page,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      await page.evaluate(() => {
        document.documentElement.dir = "rtl";
      });
      await visual(
        getCapture(page.locator(".code-block"), colorScheme, {
          item: `${id}/rtl`,
        }),
      );
    });
  });
});
