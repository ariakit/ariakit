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

// Reads the start of the range that the pieces show, from the top of the
// content of the navigation. It changes on each frame of a glide.
function getRangeStart(nav: Locator) {
  return nav.evaluate((element) => {
    const bar = element.querySelector(".nav-link-guide-bar");
    if (!bar) return Number.NaN;
    const style = getComputedStyle(bar);
    return Number.parseFloat(style.getPropertyValue("--nav-bar-start"));
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
    // The bar glides to the new current link, so it gets there over time.
    await test.expect
      .poll(async () => getShown(await getBars(nav)))
      .toEqual(["Theme"]);
    await test.expect
      .poll(async () => {
        const bar = await getCurrentBar("Theme");
        return Math.abs(bar.start - bar.lineStart);
      })
      .toBeLessThan(0.05);
    const theme = await getCurrentBar("Theme");
    test.expect(theme.start).toBeCloseTo(theme.lineStart, 1);
    test.expect(theme.end).toBeCloseTo(theme.lineEnd, 1);
  });

  test("glides the bar along the guide to the next current link", async ({
    page,
    q,
  }) => {
    const nav = q.navigation("Bar on the guide");
    await test.expect
      .poll(async () => getShown(await getBars(nav)))
      .toEqual(["Guides"]);
    // A long glide keeps the bar on its way while the test reads it.
    await page.addStyleTag({
      content: ".nav-link-guide-bar { transition-duration: 30s !important; }",
    });
    await query(nav).link("Deploy").click();
    // The bar passes the links between the old current link and the new one.
    await test.expect
      .poll(async () => {
        const shown = getShown(await getBars(nav));
        return shown.some((name) => name !== "Guides" && name !== "Deploy");
      })
      .toBe(true);
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
        const insets = fill.clipPath.match(/-?[\d.]+/g) ?? [];
        return {
          top: rect.top - origin,
          bottom: rect.bottom - origin,
          // The fill shows the whole dot when its clip has no positive inset.
          filled: insets.every((inset) => Number.parseFloat(inset) <= 0),
        };
      });
    };
    const dot = await getDot();
    const bars = await getBars(nav);
    const bar = bars.find((item) => item.name === "Configure");
    test.expect(getShown(bars)).toEqual(["Configure"]);
    test.expect(bar?.start).toBeCloseTo(dot.top, 1);
    test.expect(bar?.end).toBeCloseTo(dot.bottom, 1);
    test.expect(dot.filled).toBe(true);
    await query(nav).link("Install").click();
    // The dot that the bar leaves loses its fill.
    await test.expect.poll(async () => (await getDot()).filled).toBe(false);
    await link.click();
    // The dot fills again when the bar comes back to it.
    await test.expect.poll(async () => (await getDot()).filled).toBe(true);
  });

  test("keeps the dot of the new current link empty until the bar reaches it", async ({
    page,
    q,
  }) => {
    const nav = q.navigation("Bar and dots");
    const link = query(nav).link("Configure");
    // The height of the part of the dot that its fill shows. The clip of the
    // fill cuts it from the top and from the bottom.
    const getFillHeight = () => {
      return link.evaluate((element) => {
        const marker = element.querySelector(".nav-link-marker");
        if (!marker) throw new Error("The link has no marker");
        const { clipPath } = getComputedStyle(marker, "::after");
        const insets = clipPath.match(/-?[\d.]+/g)?.map(Number) ?? [];
        // An inset with one or two values has the same top and bottom.
        const [top = 0, , bottom = top] = insets;
        const { height } = marker.getBoundingClientRect();
        return height - Math.max(0, top) - Math.max(0, bottom);
      });
    };
    await query(nav).link("FAQ").click();
    await test.expect
      .poll(async () => getShown(await getBars(nav)))
      .toEqual(["FAQ"]);
    await test.expect.poll(getFillHeight).toBeLessThanOrEqual(0);
    // A long glide keeps the bar on its way while the test reads it.
    await page.addStyleTag({
      content:
        ".nav-link-guide-bar, .nav-link-marker { transition-duration: 30s !important; }",
    });
    await link.click();
    // The bar is on its way, along the links between the old current link and
    // the dot.
    await test.expect
      .poll(async () => {
        const shown = getShown(await getBars(nav));
        return shown.some((name) => name === "Deploy" || name === "Theme");
      })
      .toBe(true);
    test.expect(await getFillHeight()).toBeLessThanOrEqual(0);
  });

  test("draws the bar on the guide again after a link in a disclosure was current", async ({
    q,
  }) => {
    const nav = q.navigation("Bar around a disclosure");
    const getShownBars = async () => getShown(await getBars(nav));
    await test.expect.poll(getShownBars).toEqual(["Overview"]);
    await query(nav).link("Install").click();
    // The link in the disclosure has a plain bar, so the guide has no bar.
    await test.expect.poll(getShownBars).toEqual([]);
    await test
      .expect(query(nav).link("Install").locator(".control-bar"))
      .toBeVisible();
    await query(nav).link("Overview").click();
    await test.expect.poll(getShownBars).toEqual(["Overview"]);
    const bars = await getBars(nav);
    const overview = bars.find((item) => item.name === "Overview");
    test.expect(overview?.start).toBeCloseTo(overview?.lineStart ?? 0, 1);
    test.expect(overview?.end).toBeCloseTo(overview?.lineEnd ?? 0, 1);
    await query(nav).link("Support").click();
    await test.expect.poll(getShownBars).toEqual(["Support"]);
  });

  // https://github.com/ariakit/ariakit/pull/8454#discussion_r4575739532
  test("removes the bar from the guide at once when the new current link has its bar off the guide", async ({
    page,
    q,
  }) => {
    const nav = q.navigation("Bar off the guide on one link");
    const getShownBars = async () => getShown(await getBars(nav));
    await test.expect.poll(getShownBars).toEqual(["Guides"]);
    // A long glide would keep the bar on the guide while the test reads it. The
    // rule isn't important, so the inline duration that stops a cleared range
    // still wins.
    await page.addStyleTag({
      content: ".nav-link-guide-bar { transition-duration: 30s; }",
    });
    const support = query(nav).link("Support");
    await support.click();
    await test.expect(support).toHaveAttribute("aria-current", "page");
    await test.expect.poll(getShownBars).toEqual([]);
    await test.expect(support.locator(".control-bar")).toBeVisible();
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

  // https://github.com/ariakit/ariakit/pull/8458#discussion_r4576843778
  test("glides the bar from where it is when the links change during a glide", async ({
    page,
    q,
  }) => {
    const nav = q.navigation("Bar on a guide whose links change");
    await test.expect
      .poll(async () => getShown(await getBars(nav)))
      .toEqual(["Overview"]);
    const getStart = () => getRangeStart(nav);
    const overviewStart = await getStart();
    const faq = (await getBars(nav)).find((bar) => bar.name === "FAQ");
    const faqStart = faq?.lineStart ?? Number.NaN;
    // A long glide keeps the bar on its way while the links change.
    await page.addStyleTag({
      content: ".nav-link-guide-bar { transition-duration: 30s; }",
    });
    await query(nav).link("FAQ").click();
    await test.expect.poll(getStart).toBeGreaterThan(overviewStart + 1);
    const glideStart = await getStart();
    await q.button("Show blog links").click();
    await test.expect(query(nav).link("Archive")).toBeVisible();
    // The new links start from the bar on its way, near where the glide was,
    // not from the end of the glide at FAQ.
    test.expect(await getStart()).toBeLessThan((glideStart + faqStart) / 2);
  });

  // https://github.com/ariakit/ariakit/pull/8458#discussion_r4576843772
  test("shows the bar at once when the links come back after no links", async ({
    page,
    q,
  }) => {
    const nav = q.navigation("Bar on a guide whose links change");
    const getShownBars = async () => getShown(await getBars(nav));
    await test.expect.poll(getShownBars).toEqual(["Overview"]);
    await query(nav).link("FAQ").click();
    await test.expect.poll(getShownBars).toEqual(["FAQ"]);
    await q.button("Show no links").click();
    await test.expect(query(nav).link("FAQ")).toHaveCount(0);
    // A glide from the bar at FAQ would take this long to reach the new links.
    await page.addStyleTag({
      content: ".nav-link-guide-bar { transition-duration: 30s; }",
    });
    await q.button("Show blog links").click();
    await test.expect
      .poll(async () => {
        const bars = await getBars(nav);
        const archive = bars.find((bar) => bar.name === "Archive");
        if (!archive) return false;
        if (Math.abs(archive.start - archive.lineStart) > 1) return false;
        return Math.abs(archive.end - archive.lineEnd) <= 1;
      })
      .toBe(true);
  });
});
