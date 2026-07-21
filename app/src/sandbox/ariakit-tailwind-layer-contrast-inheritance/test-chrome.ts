import { expect } from "@playwright/test";
import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

function getBackgroundColor(layer: Locator) {
  return layer.evaluate((element) => getComputedStyle(element).backgroundColor);
}

withFramework(import.meta.dirname, async ({ test }) => {
  for (const scheme of ["light", "dark"] as const) {
    test.describe(`${scheme} scheme`, () => {
      test.use({ colorScheme: scheme });

      test("inherits the parent color in bare nested layers", async ({ q }) => {
        const parent = q.region("Parent layer");
        const child = q.region("Child layer");
        const grandchild = q.region("Grandchild layer");

        for (const contrast of [0, 5, 50, 100]) {
          await parent.evaluate((element, value) => {
            element.style.setProperty("--contrast", String(value));
          }, contrast);
          const parentColor = await getBackgroundColor(parent);

          await expect
            .poll(() => getBackgroundColor(child), {
              message: `Child should inherit at contrast ${contrast}`,
            })
            .toBe(parentColor);
          await expect
            .poll(() => getBackgroundColor(grandchild), {
              message: `Grandchild should inherit at contrast ${contrast}`,
            })
            .toBe(parentColor);
        }
      });

      test("preserves modifiers through a bare layer", async ({ q }) => {
        const parentColor = await getBackgroundColor(q.region("Parent layer"));
        const directOffsetColor = await getBackgroundColor(
          q.region("Direct layer offset"),
        );
        const directStateColor = await getBackgroundColor(
          q.region("Direct state darken"),
        );

        expect(directOffsetColor).not.toBe(parentColor);
        expect(directStateColor).not.toBe(parentColor);
        expect(await getBackgroundColor(q.region("Nested layer offset"))).toBe(
          directOffsetColor,
        );
        expect(await getBackgroundColor(q.region("Nested state darken"))).toBe(
          directStateColor,
        );
      });
    });
  }
});
