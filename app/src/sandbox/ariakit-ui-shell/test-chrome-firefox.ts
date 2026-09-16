import { expect } from "@playwright/test";
import {
  forEachColorScheme,
  getViewportCapture,
} from "#app/test-utils/ariakit-ui.ts";
import { withFramework } from "#app/test-utils/preview.ts";
import { selectScenario } from "./test-helpers.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test.use({ viewport: { width: 1440, height: 900 } });

  // https://github.com/ariakit/ariakit/issues/7532
  test("keeps each seam on its facing side in forced colors, including RTL", async ({
    page,
    q,
  }) => {
    await selectScenario(q, "geometry");
    await page.emulateMedia({ forcedColors: "active" });
    await q.button("Toggle layout navigation").click();
    await q.button("Toggle layout contents").click();
    for (const rtl of [false, true]) {
      await q.checkbox("Right to left").setChecked(rtl);
      const parts = [
        { element: q.banner(), side: "bottom" },
        { element: q.contentinfo(), side: "top" },
        {
          element: q.navigation("Layout navigation"),
          side: rtl ? "left" : "right",
        },
        {
          element: q.navigation("Layout contents"),
          side: rtl ? "right" : "left",
        },
      ];
      for (const { element, side } of parts) {
        await expect(element).toHaveCSS("box-shadow", "none");
        for (const edge of ["top", "right", "bottom", "left"]) {
          await expect(element).toHaveCSS(
            `border-${edge}-width`,
            edge === side ? "2px" : "0px",
          );
        }
        await expect(element).toHaveCSS(`border-${side}-style`, "solid");
      }
    }
    await q.checkbox("Show seams").uncheck();
    for (const element of [
      q.banner(),
      q.contentinfo(),
      q.navigation("Layout navigation"),
      q.navigation("Layout contents"),
    ]) {
      for (const side of ["top", "right", "bottom", "left"]) {
        await expect(element).toHaveCSS(`border-${side}-width`, "0px");
      }
    }
  });

  test.describe("captures", () => {
    test.describe.configure({ timeout: 120_000 });

    // WebKit cannot emulate forced colors. Keep this existing capture in the
    // two engines that apply the requested media feature.
    // https://github.com/ariakit/ariakit/issues/7532
    test("blurred header in forced colors @visual", async ({
      page,
      visual,
    }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.emulateMedia({ forcedColors: "active" });
      await forEachColorScheme(page, async (colorScheme) => {
        await page.evaluate(() => window.scrollTo(0, 300));
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(300);
        await visual(getViewportCapture(page, colorScheme));
      });
    });
  });
});
