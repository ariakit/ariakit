import { expect } from "@playwright/test";
import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

const CONTRAST_VALUES = [0, 5, 50, 100];

// Longhands that do nothing unless their partner utility is on the same
// element. `baseline` carries that partner with no longhands, so it isolates
// the longhand contribution: comparing against the parent instead would pass on
// the contrast bias alone, which any element carrying the partner picks up.
const INERT_LONGHANDS = [
  {
    label: "mix",
    baseline: "Direct mix default",
    inert: "Nested mix inputs",
    nested: "Nested mix",
    direct: "Direct mix",
  },
  {
    label: "contrast",
    baseline: "Direct contrast default",
    inert: "Nested contrast input",
    nested: "Nested contrast",
    direct: "Direct contrast",
  },
];

function getBackgroundColor(layer: Locator) {
  return layer.evaluate((element) => getComputedStyle(element).backgroundColor);
}

function setContrast(layer: Locator, value: number) {
  return layer.evaluate((element, value) => {
    element.style.setProperty("--contrast", String(value));
  }, value);
}

withFramework(import.meta.dirname, async ({ test }) => {
  for (const scheme of ["light", "dark"] as const) {
    test.describe(`${scheme} scheme`, () => {
      test.use({ colorScheme: scheme });

      test("inherits the parent color in bare nested layers", async ({ q }) => {
        const parent = q.region("Parent layer");
        const child = q.region("Child layer");
        const grandchild = q.region("Grandchild layer");

        for (const contrast of CONTRAST_VALUES) {
          await setContrast(parent, contrast);
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

      for (const longhand of INERT_LONGHANDS) {
        // https://github.com/ariakit/ariakit/issues/7392
        test(`inherits the parent color through inert ${longhand.label} longhands`, async ({
          q,
        }) => {
          const parent = q.region("Parent layer");
          const inert = q.region(longhand.inert);

          for (const contrast of CONTRAST_VALUES) {
            await setContrast(parent, contrast);
            const parentColor = await getBackgroundColor(parent);

            await expect
              .poll(() => getBackgroundColor(inert), {
                message: `Should inherit at contrast ${contrast}`,
              })
              .toBe(parentColor);
          }
        });

        // https://github.com/ariakit/ariakit/issues/7392
        test(`keeps the ${longhand.label} longhands feeding their utility`, async ({
          q,
        }) => {
          const parent = q.region("Parent layer");
          const nested = q.region(longhand.nested);
          const direct = q.region(longhand.direct);

          // Read this before the loop starts moving `--contrast`. The
          // contrast pair converges at a high enough `--contrast`, where `50`
          // and the `25` default resolve to the same color.
          const baselineColor = await getBackgroundColor(
            q.region(longhand.baseline),
          );
          expect(await getBackgroundColor(direct)).not.toBe(baselineColor);

          for (const contrast of CONTRAST_VALUES) {
            await setContrast(parent, contrast);

            // Both reads sit inside the poll. They are descendants of the
            // element that changed, so a reference read taken outside could
            // capture the color from before the change reached them.
            await expect
              .poll(
                async () => {
                  const [nestedColor, directColor] = await Promise.all([
                    getBackgroundColor(nested),
                    getBackgroundColor(direct),
                  ]);
                  if (nestedColor === directColor) return "match";
                  return `${nestedColor} != ${directColor}`;
                },
                {
                  message: `Nested should match direct at contrast ${contrast}`,
                },
              )
              .toBe("match");
          }
        });
      }
    });
  }
});
