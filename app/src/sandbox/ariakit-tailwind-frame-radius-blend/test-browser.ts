import type { query as getQuery } from "@ariakit/test/playwright";
import { expect } from "@playwright/test";
import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

type Query = ReturnType<typeof getQuery>;

const DISTANCES = ["4px", "8px", "10px", "12px", "14px", "15.75px", "16px"];
// Each engine has its own largest length, so a pill radius has no exact value.
const PILL_RADIUS = 1e6;

async function getCardRadii(panel: Locator) {
  const cards = panel.locator("[data-card]");
  await expect(cards.first()).toBeVisible();
  return cards.evaluateAll((elements) =>
    elements.map((element) => {
      return Number.parseFloat(getComputedStyle(element).borderTopLeftRadius);
    }),
  );
}

// Returns the card radius at each distance from the panel edge.
async function getSweepRadii(q: Query, name: string) {
  const radii: number[] = [];
  for (const distance of DISTANCES) {
    const [radius] = await getCardRadii(q.region(`${name}, ${distance}`));
    if (radius == null) {
      throw new Error(`Card not found in ${name}, ${distance}`);
    }
    radii.push(radius);
  }
  return radii;
}

withFramework(import.meta.dirname, async ({ test }) => {
  test("raises the nested radius in a line from 0.5rem to 1rem", async ({
    q,
  }) => {
    // The concentric radius is 5px at 0.5rem. From there, the radius goes to
    // the declared radius at 1rem and does not fall to the 1.75px minimum. At
    // 15.75px, it is still on the line and has no step to the declared radius.
    expect(await getSweepRadii(q, "13px panel, 21px card")).toEqual([
      9, 5, 9, 13, 17, 20.5, 21,
    ]);
    expect(await getSweepRadii(q, "13px panel, 9px card")).toEqual([
      9, 5, 6, 7, 8, 8.875, 9,
    ]);
  });

  test("keeps a concentric radius that is larger than the declared radius", async ({
    q,
  }) => {
    // The declared radius takes over within 0.5px of 1rem.
    expect(await getSweepRadii(q, "24px panel, 8px card")).toEqual([
      20, 16, 14, 12, 10, 8, 8,
    ]);
    expect(await getSweepRadii(q, "13px panel, card without a radius")).toEqual(
      [9, 5, 3, 1, 0, 0, 0],
    );
  });

  test("keeps pills", async ({ q }) => {
    const fullCard = await getSweepRadii(q, "13px panel, full card");
    expect(fullCard.slice(0, 2)).toEqual([9, 5]);
    for (const radius of fullCard.slice(2)) {
      expect(radius).toBeGreaterThan(PILL_RADIUS);
    }
    // A card in a pill stays a pill until it takes its declared radius.
    const fullPanel = await getSweepRadii(q, "Full panel, 8px card");
    for (const radius of fullPanel.slice(0, 5)) {
      expect(radius).toBeGreaterThan(PILL_RADIUS);
    }
    expect(fullPanel.slice(5)).toEqual([8, 8]);
  });

  test("matches the documented radii of the default tokens", async ({ q }) => {
    // The panel and the card declare 12px. The values are 0.25rem, 0.5rem,
    // 0.625rem, and 0.75rem.
    expect(await getCardRadii(q.region("ak-frame-xl/2"))).toEqual([4]);
    expect(await getCardRadii(q.region("ak-frame-xl/3"))).toEqual([8]);
    expect(await getCardRadii(q.region("ak-frame-xl/3.5"))).toEqual([10]);
    expect(await getCardRadii(q.region("ak-frame-xl/4"))).toEqual([12]);
  });

  test("measures the distance with the frame margin and the parent border", async ({
    q,
  }) => {
    expect(await getCardRadii(q.region("Forced radius"))).toEqual([21]);
    // Each card is 12px from the panel edge, like the 12px card above.
    expect(await getCardRadii(q.region("Frame margin"))).toEqual([13]);
    expect(await getCardRadii(q.region("Panel border"))).toEqual([13]);
    expect(await getCardRadii(q.region("Panel ring"))).toEqual([13]);
  });

  test("uses the radius of each parent frame in nested frames", async ({
    q,
  }) => {
    // The cover takes the panel radius, and its card is 10px from its edge.
    expect(await getCardRadii(q.region("Cover frame"))).toEqual([13, 9]);
    expect(await getCardRadii(q.region("Three levels"))).toEqual([
      13, 9, 16.1875,
    ]);
  });
});
