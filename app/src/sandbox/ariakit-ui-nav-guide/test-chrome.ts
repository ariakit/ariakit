import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

interface Piece {
  /** The text of the link that holds the piece. */
  name: string;
  /** The part of the piece that shows, from the top of the navigation. */
  start: number;
  end: number;
  /** The line along the row of the link, from the top of the navigation. */
  lineStart: number;
  lineEnd: number;
}

// Reads the part of each bar piece that its range shows. The pieces are hidden
// from assistive technology, so their class finds them.
function getBars(nav: Locator) {
  return nav.evaluate((element) => {
    const origin = element.getBoundingClientRect().top + element.clientTop;
    const bars = [...element.querySelectorAll(".nav-link-guide-bar")];
    return bars.map((bar): Piece => {
      const link = bar.closest("a");
      if (!link) throw new Error("A bar piece has no link");
      const style = getComputedStyle(bar);
      const rect = bar.getBoundingClientRect();
      const linkRect = link.getBoundingClientRect();
      const top = Number.parseFloat(style.getPropertyValue("--nav-bar-top"));
      const pieceTop = Number.isNaN(top) ? 0 : top;
      const start = Number.parseFloat(
        style.getPropertyValue("--nav-bar-start"),
      );
      const end = Number.parseFloat(style.getPropertyValue("--nav-bar-end"));
      const offset = rect.top - origin - pieceTop;
      const padding = Number.parseFloat(getComputedStyle(link).paddingTop);
      return {
        name: link.textContent ?? "",
        start: Math.max(rect.top - origin, start + offset),
        end: Math.min(rect.bottom - origin, end + offset),
        lineStart: linkRect.top - origin + padding,
        lineEnd: linkRect.bottom - origin - padding,
      };
    });
  });
}

function getShown(bars: Piece[]) {
  return bars.filter((bar) => bar.end - bar.start > 0.5).map((bar) => bar.name);
}

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("keeps the numbers as near to the links without a guide as on a guide", async ({
    q,
  }) => {
    const getDistance = (nav: Locator) => {
      return nav.evaluate((element) => {
        const link = element.querySelector("a");
        const marker = link?.querySelector(".nav-link-marker");
        if (!link || !marker) return Number.NaN;
        const linkRect = link.getBoundingClientRect();
        const markerRect = marker.getBoundingClientRect();
        return linkRect.left - markerRect.right;
      });
    };
    const plain = await getDistance(q.navigation("Numbered links"));
    const guided = await getDistance(q.navigation("Numbers on a guide"));
    // The number cuts into the start of its link.
    test.expect(plain).toBeLessThan(0);
    test.expect(plain).toBeCloseTo(guided, 1);
  });

  test("keeps the numbers of an ordered list in a group inside the navigation", async ({
    q,
  }) => {
    const nav = q.navigation("Numbered group");
    const getMarkerOffsets = () => {
      return nav.evaluate((element) => {
        const navRect = element.getBoundingClientRect();
        const links = [...element.querySelectorAll("a")];
        return links.map((link) => {
          const marker = link.querySelector(".nav-link-marker");
          if (!marker) return Number.NaN;
          const linkRect = link.getBoundingClientRect();
          const markerRect = marker.getBoundingClientRect();
          return {
            inside: markerRect.left - navRect.left,
            distance: linkRect.left - markerRect.right,
          };
        });
      });
    };
    const offsets = await getMarkerOffsets();
    test.expect(offsets).toHaveLength(3);
    const guided = await q
      .navigation("Numbers on a guide")
      .evaluate((element) => {
        const link = element.querySelector("a");
        const marker = link?.querySelector(".nav-link-marker");
        if (!link || !marker) return Number.NaN;
        return (
          link.getBoundingClientRect().left -
          marker.getBoundingClientRect().right
        );
      });
    for (const offset of offsets) {
      if (typeof offset === "number") throw new Error("A link has no marker");
      test.expect(offset.inside).toBeGreaterThanOrEqual(0);
      test.expect(offset.distance).toBeCloseTo(guided, 1);
    }
  });

  test("draws the bar along the current link on the guide", async ({ q }) => {
    const nav = q.navigation("Bar on the guide");
    const getCurrentBar = async (name: string) => {
      const bars = await getBars(nav);
      test.expect(getShown(bars)).toEqual([name]);
      const bar = bars.find((item) => item.name === name);
      if (!bar) throw new Error(`No bar for ${name}`);
      return bar;
    };
    const guides = await getCurrentBar("Guides");
    test.expect(guides.start).toBeCloseTo(guides.lineStart, 1);
    test.expect(guides.end).toBeCloseTo(guides.lineEnd, 1);
    // The bar covers the guide piece of the link.
    const centers = await query(nav)
      .link("Guides")
      .evaluate((link) => {
        const getCenter = (selector: string) => {
          const piece = link.querySelector(selector);
          if (!piece) return Number.NaN;
          const rect = piece.getBoundingClientRect();
          const style = getComputedStyle(piece, "::after");
          const width = Number.parseFloat(style.borderLeftWidth);
          return rect.left + Number.parseFloat(style.left) + width / 2;
        };
        return {
          bar: getCenter(".nav-link-guide-bar"),
          guide: getCenter(".nav-link-guide"),
        };
      });
    test.expect(centers.bar).toBeCloseTo(centers.guide, 1);
    await query(nav).link("Theme").click();
    const theme = await getCurrentBar("Theme");
    test.expect(theme.start).toBeCloseTo(theme.lineStart, 1);
    test.expect(theme.end).toBeCloseTo(theme.lineEnd, 1);
  });

  test("stops the bar at the dot of the current link and fills the dot", async ({
    q,
  }) => {
    const nav = q.navigation("Bar and dots");
    const link = query(nav).link("Configure");
    const getDot = () => {
      return link.evaluate((element) => {
        const marker = element.querySelector(".nav-link-marker");
        if (!marker) throw new Error("The link has no marker");
        const origin =
          element.closest("nav")?.getBoundingClientRect().top ?? Number.NaN;
        const rect = marker.getBoundingClientRect();
        const fill = getComputedStyle(marker, "::after");
        return {
          top: rect.top - origin,
          bottom: rect.bottom - origin,
          // The fill shows the whole dot when its clip has no positive inset.
          clip: fill.clipPath,
        };
      });
    };
    const dot = await getDot();
    const bars = await getBars(nav);
    const bar = bars.find((item) => item.name === "Configure");
    test.expect(getShown(bars)).toEqual(["Configure"]);
    test.expect(bar?.start).toBeCloseTo(dot.top, 1);
    test.expect(bar?.end).toBeCloseTo(dot.bottom, 1);
    test.expect(dot.clip).toBe("inset(-1px)");
    await query(nav).link("Install").click();
    // The fill of the dot that the bar leaves wipes out over a transition.
    await test.expect
      .poll(async () => (await getDot()).clip)
      .not.toBe("inset(-1px)");
  });

  test("keeps a plain bar at the end side and in a disclosure", async ({
    q,
  }) => {
    const end = q.navigation("Bar at the end");
    await test.expect(end.locator(".nav-link-guide")).not.toHaveCount(0);
    await test.expect(end.locator(".nav-link-guide-bar")).toHaveCount(0);
    const bar = query(end).link("Guides").locator(".control-bar");
    await test.expect(bar).toBeVisible();
    const disclosure = q.navigation("Disclosure in a guide");
    const install = query(disclosure).link("Install");
    await test.expect(install.locator(".control-bar")).toBeVisible();
    await test.expect(install.locator(".nav-link-guide-bar")).toHaveCount(0);
    await test.expect(install.locator(".nav-link-marker")).toHaveCount(0);
    // The top-level links still have their numbers.
    const overview = query(disclosure).link("Overview");
    await test.expect(overview.locator(".nav-link-marker")).toBeVisible();
    // The guide starts again at the row after the disclosure, with no bend that
    // reaches up from the row.
    const guideTop = await query(disclosure)
      .link("FAQ")
      .evaluate((link) => {
        const guide = link.querySelector(".nav-link-guide");
        if (!guide) return Number.NaN;
        return (
          guide.getBoundingClientRect().top - link.getBoundingClientRect().top
        );
      });
    test.expect(guideTop).toBeGreaterThanOrEqual(0);
  });
});
