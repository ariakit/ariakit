import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

function paintedShadows(shadow: string) {
  // Discard transparent layers across RGB/OKLCH and inset serialization.
  return shadow.replace(
    /(?:oklch\([^)]* \/ 0\)|rgba\(0, 0, 0, 0\)) 0px 0px 0px 0px(?: inset)?(?:, )?/g,
    "",
  );
}

withFramework(import.meta.dirname, async ({ test }) => {
  for (const colorScheme of ["light", "dark"] as const) {
    test.describe(colorScheme, () => {
      test.use({ colorScheme });

      // https://github.com/ariakit/ariakit/issues/7470
      test("suppresses zero-width ring paint and preserves frame geometry", async ({
        q,
      }) => {
        let borders = 0;
        let rings = 0;
        for (const direction of ["Darkening", "Lightening"]) {
          for (const [variant, width] of [
            ["Default", 1],
            ["Explicit", 4],
            ["Inherited", 4],
            ["Fractional", 0.5],
            ["Zero", 0],
            ["Inset", 4],
            ["Theme", 4],
          ] as const) {
            const button = q.button(`${direction} ${variant}`);
            const style = await button.evaluate((element) => {
              const style = getComputedStyle(element);
              return {
                border: Number.parseFloat(style.borderTopWidth),
                ring: Number.parseFloat(
                  style.getPropertyValue("--ak-frame-ring"),
                ),
                shadow: style.boxShadow,
                radius: style.borderTopLeftRadius,
                padding: style.paddingTop,
              };
            });
            expect(style.radius).toBe("12px");
            expect(style.padding).toBe("8px");
            if (style.ring > 0) {
              rings += 1;
              expect(style.ring).toBe(width);
              expect(style.border).toBe(0);
              const originalShadow = await button.evaluate((element) => {
                const style = getComputedStyle(element);
                const width = style.getPropertyValue("--ak-frame-ring");
                const color =
                  style.getPropertyValue("--tw-ring-color") ||
                  style.getPropertyValue("--default-ring-color");
                const inset = style.getPropertyValue("--tw-ring-inset");
                // Compare colors in one space without changing their alpha.
                element.style.setProperty(
                  "--tw-ring-shadow",
                  `${inset} 0 0 0 ${width} oklch(from ${color} l c h)`,
                );
                const shadow = getComputedStyle(element).boxShadow;
                element.style.removeProperty("--tw-ring-shadow");
                return shadow;
              });
              expect(style.shadow).toBe(originalShadow);
              continue;
            }
            borders += 1;
            // Browsers quantize fractional border widths to physical pixels.
            expect(style.border).toBe(width === 0.5 ? 1 : width);
            const withoutRing = await button.evaluate((element) => {
              element.style.setProperty("--tw-ring-shadow", "0 0 #0000");
              return getComputedStyle(element).boxShadow;
            });
            // The diagnostic removes only the ring term, preserving other
            // shadows.
            expect(paintedShadows(style.shadow)).toBe(
              paintedShadows(withoutRing),
            );
            await button.evaluate((element) =>
              element.style.removeProperty("--tw-ring-shadow"),
            );
          }
        }
        expect(borders).toBeGreaterThan(0);
        expect(rings).toBeGreaterThan(0);
      });

      // https://github.com/ariakit/ariakit/issues/7470
      test("preserves focus rings and composed shadows", async ({ q }) => {
        const button = q.button("Darkening Explicit");
        const shadow = await button.evaluate((element) => {
          const style = getComputedStyle(element);
          return [
            style.getPropertyValue("--tw-shadow"),
            style.getPropertyValue("--tw-inset-shadow"),
          ];
        });
        await button.focus();
        await expect(button).toBeFocused();
        const focused = await button.evaluate((element) => {
          const style = getComputedStyle(element);
          return {
            ring: style.boxShadow,
            offset: style.getPropertyValue("--tw-ring-offset-width"),
            shadow: [
              style.getPropertyValue("--tw-shadow"),
              style.getPropertyValue("--tw-inset-shadow"),
            ],
          };
        });
        expect(focused.ring).toContain(
          "oklch(0.546 0.245 262.881) 0px 0px 0px 4px",
        );
        expect(focused.offset).toBe("2px");
        expect(focused.shadow).toEqual(shadow);
      });
    });
  }
});
