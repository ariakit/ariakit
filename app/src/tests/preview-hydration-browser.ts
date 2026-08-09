import { test } from "#app/test-utils/fixtures.ts";
import { gotoAndSettle } from "#app/test-utils/preview.ts";

test("waits for delayed preview hydration", async ({ page }) => {
  // Delay Astro's client:load callback without keeping the network busy. This
  // reproduces CI returning from network idle while the preview is still SSR.
  await page.addInitScript(`{
    const astro = {};
    Object.defineProperty(astro, "load", {
      configurable: true,
      set(load) {
        Object.defineProperty(astro, "load", {
          configurable: true,
          value: async (callback) => {
            await new Promise((resolve) => setTimeout(resolve, 2_000));
            return load(callback);
          },
        });
      },
    });
    Object.defineProperty(self, "Astro", {
      configurable: true,
      value: astro,
    });
  }`);
  await gotoAndSettle(
    page,
    "/react/previews/combobox-select-selected-value-presentation/",
    { waitForHydration: true },
  );

  test.expect(await page.locator("astro-island[ssr]").count()).toBe(0);
});
