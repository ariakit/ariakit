import { expect } from "@playwright/test";
import {
  getBackgroundContrast,
  getPaintedBackgrounds,
} from "#app/test-utils/contrast.ts";
import { withFramework } from "#app/test-utils/preview.ts";

const SURFACES = [
  "light canvas",
  "dark canvas",
  "brand surface",
  "light gray surface",
  "dark gray surface",
  "danger surface",
  "black surface",
  "white surface",
];

// The ratio of each amount: 3 ^ (amount / 30).
const AMOUNT_FILLS = [
  ["Brand fill", 3],
  ["Fill", 3],
  ["Fill 41", 3 ** (41 / 30)],
  ["Decorative fill", 3 ** (10 / 30)],
] as const;

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/8080
  test("fills reach the ratio of their amount against the parent layer", async ({
    q,
  }) => {
    for (const surface of SURFACES) {
      for (const [name, ratio] of AMOUNT_FILLS) {
        const label = `${name} on ${surface}`;
        await expect
          .poll(() => getBackgroundContrast(q.region(label)), {
            message: label,
          })
          .toBeGreaterThanOrEqual(ratio);
      }
    }
  });

  // The default ratio is 3:1, raised by half in contrast-more, and scaled
  // toward 1:1 by the default disabled contrast scale of 0.25.
  for (const [contrast, target, disabledTarget] of [
    ["no-preference", 3, 1.5],
    ["more", 4.5, 1 + (3 * (1 + 0.5 * 0.25) - 1) * 0.25],
  ] as const) {
    test.describe(contrast, () => {
      // Firefox doesn't apply an emulated contrast change after the page loads
      // to the stylesheet's prefers-contrast rules, so the page loads with it.
      test.use({ contrast });

      // https://github.com/ariakit/ariakit/issues/8080
      test(`fills reach the default ratio against the parent layer (${contrast})`, async ({
        q,
      }) => {
        for (const surface of SURFACES) {
          for (const name of ["Brand fill", "Fill"]) {
            const label = `${name} on ${surface}`;
            await expect
              .poll(() => getBackgroundContrast(q.region(label)), {
                message: label,
              })
              .toBeGreaterThanOrEqual(target);
          }
          const label = `Disabled fill on ${surface}`;
          await expect
            .poll(() => getBackgroundContrast(q.region(label)), {
              message: label,
            })
            .toBeGreaterThanOrEqual(disabledTarget);
        }
      });

      // The bar paints on the surface around its control, which has the
      // opposite scheme, so the floor must move away from that surface.
      // https://github.com/ariakit/ariakit/issues/8080
      test(`an outset bar reaches the ratio against the outer layer (${contrast})`, async ({
        q,
      }) => {
        for (const surface of SURFACES) {
          const label = `Outset bar on ${surface}`;
          await expect
            .poll(
              () => getBackgroundContrast(q.region(label), q.region(surface)),
              {
                message: label,
              },
            )
            .toBeGreaterThanOrEqual(target);
        }
      });
    });
  }

  // The lightness shift keeps the vivid fill on both canvases, so only the
  // floor could change it.
  // https://github.com/ariakit/ariakit/issues/8080
  test("keeps a fill that passes", async ({ q }) => {
    for (const surface of ["light canvas", "dark canvas"]) {
      const label = `Vivid fill on ${surface}`;
      const regular = await getPaintedBackgrounds(
        q.region(`Vivid fill without floor on ${surface}`),
      );
      const floored = await getPaintedBackgrounds(q.region(label));
      for (const [index, channel] of floored.background.entries()) {
        const expected = regular.background[index];
        if (expected == null) continue;
        // Firefox stores the alpha that carries the parent luminance in 8 bits,
        // which can move a passing fill by one 8-bit level.
        expect(channel, label).toBeCloseTo(expected, 2);
      }
    }
  });
});
