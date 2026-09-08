import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

interface Box {
  left: number;
  right: number;
  top: number;
  width: number;
  height: number;
}

function getBox(locator: Locator) {
  return locator.evaluate((element): Box => {
    const rect = element.getBoundingClientRect();
    return {
      left: rect.left,
      right: rect.right,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    };
  });
}

/**
 * The guide line is the ::before of the disclosure content around the link,
 * which no locator can reach, so its box is read from computed styles. The line
 * has no content of its own: it is one border, so the box is the line.
 */
function getGuideCentre(link: Locator) {
  return link.evaluate((element) => {
    let node = element.parentElement;
    while (node) {
      const line = getComputedStyle(node, "::before");
      if (line.position === "absolute") {
        const rect = node.getBoundingClientRect();
        const width =
          parseFloat(line.borderLeftWidth) + parseFloat(line.borderRightWidth);
        return rect.left + node.clientLeft + parseFloat(line.left) + width / 2;
      }
      node = node.parentElement;
    }
    throw new Error("No guide line around the link");
  });
}

withFramework(import.meta.dirname, async ({ test, query }) => {
  // The glider is a presentational item with no accessible name, so it is the
  // one thing here reached through the DOM. Everything else drives the nav as a
  // user would.
  const getGlider = (link: Locator) =>
    link.locator("xpath=ancestor::ul[1]").locator("li[role=presentation]");

  test("the bar sits on the guide line beside the current page", async ({
    q,
  }) => {
    const nav = q.navigation("Bar on the guide");
    const link = query(nav).link("Introduction");
    await test.expect(link).toHaveAttribute("aria-current", "page");
    const glider = getGlider(link);
    await test.expect(glider).toBeVisible();
    const bar = await getBox(glider);
    const row = await getBox(link);
    test.expect(bar.top).toBeCloseTo(row.top, 1);
    test.expect(bar.height).toBeCloseTo(row.height, 1);
    test.expect(bar.width).toBeLessThan(row.width / 10);
    const centre = await getGuideCentre(link);
    test.expect(bar.left + bar.width / 2).toBeCloseTo(centre, 0);
  });

  test("the bar follows the page the user picks", async ({ q }) => {
    const nav = q.navigation("Bar on the guide");
    const next = query(nav).link("Installation");
    await next.click();
    await test.expect(next).toHaveAttribute("aria-current", "page");
    await test
      .expect(query(nav).link("Introduction"))
      .not.toHaveAttribute("aria-current");
    const row = await getBox(next);
    // The glider animates its travel, so the box is polled to its rest.
    await test.expect
      .poll(async () => (await getBox(getGlider(next))).top)
      .toBeCloseTo(row.top, 1);
  });

  test("the bar ends on the row's end edge", async ({ q }) => {
    const nav = q.navigation("Bar at the end");
    const link = query(nav).link("Styling");
    const bar = await getBox(getGlider(link));
    const row = await getBox(link);
    test.expect(bar.right).toBeCloseTo(row.right, 0);
    test.expect(bar.top).toBeCloseTo(row.top, 1);
    test.expect(bar.height).toBeCloseTo(row.height, 1);
  });

  test("a cover takes the current row's box and its paint", async ({ q }) => {
    const nav = q.navigation("Cover");
    const link = query(nav).link("Introduction");
    const glider = getGlider(link);
    const cover = await getBox(glider);
    const row = await getBox(link);
    test.expect(cover).toEqual(row);
    const paint = (locator: Locator) =>
      locator.evaluate((element) => getComputedStyle(element).backgroundColor);
    test.expect(await paint(link)).toBe("rgba(0, 0, 0, 0)");
    test.expect(await paint(glider)).not.toBe("rgba(0, 0, 0, 0)");
  });

  test("no bar without a current page", async ({ q }) => {
    const nav = q.navigation("No current page");
    const link = query(nav).link("Introduction");
    await test.expect(link).not.toHaveAttribute("aria-current");
    await test.expect(getGlider(link)).toBeHidden();
  });

  test("the bar mirrors onto the guide line in a right-to-left nav", async ({
    q,
  }) => {
    const nav = q.navigation("Right to left");
    const link = query(nav).link("Composition");
    const bar = await getBox(getGlider(link));
    const row = await getBox(link);
    const centre = await getGuideCentre(link);
    test.expect(bar.left + bar.width / 2).toBeCloseTo(centre, 0);
    // The guide runs past the rows' end, which is their right side here.
    test.expect(bar.left).toBeGreaterThanOrEqual(row.right);
  });
});
