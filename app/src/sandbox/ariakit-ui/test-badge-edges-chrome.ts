import type { Locator, Page } from "@playwright/test";
import {
  waitForPreviewHydration,
  withFramework,
} from "#app/test-utils/preview.ts";

// The lightness and hue channels of the edge color a ring paints with.
async function getEdge(badge: Locator) {
  const edge = await badge.evaluate((node) =>
    getComputedStyle(node).getPropertyValue("--ak-edge"),
  );
  const match = edge.match(/^oklch\(([\d.]+) [\d.]+ ([\d.]+)/);
  if (!match) return { lightness: Number.NaN, hue: Number.NaN };
  return { lightness: Number(match[1]), hue: Number(match[2]) };
}

async function loadInDarkScheme(page: Page) {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.reload({ waitUntil: "load" });
  await waitForPreviewHydration(page);
}

withFramework(
  import.meta.dirname,
  { route: "badge" },
  async ({ test, query }) => {
    // The badge is the element that paints the ring, the parent of its label.
    const getBadge = (article: Locator, label: string) =>
      query(article).text(label).locator("..");

    test("an outline ring stands out from the surface", async ({ page, q }) => {
      const badge = getBadge(q.article("Outline"), "Optional");
      // Without the full push, the ring takes the lightness of the surface it
      // sits on and cannot be seen at any weight.
      await test.expect
        .poll(async () => (await getEdge(badge)).lightness)
        .toBeLessThan(0.5);
      await loadInDarkScheme(page);
      await test.expect
        .poll(async () => (await getEdge(badge)).lightness)
        .toBeGreaterThan(0.5);
    });

    test("a colored ring keeps the lightness of its color", async ({ q }) => {
      // A colored ring must not take the full push, which turns it black.
      const badge = getBadge(q.article("Brand"), "Beta");
      await test.expect
        .poll(async () => (await getEdge(badge)).lightness)
        .toBeGreaterThan(0.3);
    });

    test("a raw ring paints the exact color", async ({ q }) => {
      const badge = getBadge(q.article("Raw ring"), "Verified");
      // The badge's own ring weight default must not come back after $edgeRaw
      // clears it, or the ring stays at a fifth of the color's alpha.
      await test.expect
        .poll(() =>
          badge.evaluate((node) =>
            getComputedStyle(node).getPropertyValue("--ak-edge"),
          ),
        )
        .toMatch(/^oklch\(0\.567 0\.1546 248\.51\d*\)$/);
    });

    test("a hue reaches the ring", async ({ q }) => {
      const badge = getBadge(q.article("Hue"), "Approved");
      // The ring copies the layer color, so it keeps the brand hue unless the
      // hue reaches the edge on its own.
      await test.expect
        .poll(async () => (await getEdge(badge)).hue)
        .toBeCloseTo(142.5, 0);
    });

    test("a badge without a border has no ring in a bordered box", async ({
      q,
    }) => {
      // The example box is a bordered frame, and the custom property that holds
      // its border width inherits into the badge.
      const badge = getBadge(q.article("Flat tint"), "Needs review");
      await test.expect(badge).toHaveCSS("box-shadow", "none");
    });

    test("a trailing count takes the smaller font", async ({ q }) => {
      // The badge kind sizes an element child of the slot, 0.8125em of the 14px
      // badge text, so the slot must wrap the count in one.
      const count = query(q.article("Trailing count")).text("12");
      await test.expect(count).toHaveCSS("font-size", "11.375px");
    });
  },
);
