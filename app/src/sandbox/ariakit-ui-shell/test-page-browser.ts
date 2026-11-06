import type { Locator } from "@playwright/test";
import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";
import {
  expectAligned,
  expectCentered,
  getBox,
  getSidebar,
  selectScenario,
} from "./test-helpers.ts";

/** Waits until `part` starts at `start` and ends at `end`, within a pixel. */
async function expectEdges(part: Locator, start: number, end: number) {
  await expect
    .poll(async () => {
      const box = await getBox(part);
      return Math.max(
        Math.abs(box.x - start),
        Math.abs(box.x + box.width - end),
      );
    })
    .toBeLessThan(0.5);
}

/** The left edge of `left` and the right edge of `right`, in px. */
async function getOuterEdges(left: Locator, right: Locator) {
  const [leftBox, rightBox] = await Promise.all([getBox(left), getBox(right)]);
  return [leftBox.x, rightBox.x + rightBox.width] as const;
}

withFramework(import.meta.dirname, async ({ test, query }) => {
  test.use({ viewport: { width: 1600, height: 900 } });

  test.beforeEach(async ({ q }) => {
    await selectScenario(q, "page");
  });

  test("keeps the bars at the full width and the sidebars in the box", async ({
    q,
    page,
  }) => {
    await expectEdges(page.locator(".shell-header").first(), 0, 1600);
    await expectEdges(page.locator(".shell-footer").first(), 0, 1600);
    // An 80rem box centered in the 1600px page.
    const [start, end] = await getOuterEdges(
      getSidebar(q, "Start sidebar"),
      getSidebar(q, "End sidebar"),
    );
    expect(start).toBeCloseTo(160, 0);
    expect(end).toBeCloseTo(1440, 0);
    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    expect(scrollWidth).toBe(1600);
  });

  test("lines up the bar parts with the sidebar items for each sidebar state", async ({
    q,
    page,
  }) => {
    const [start, end] = await getOuterEdges(
      q.group("Start items"),
      q.group("End items"),
    );
    // The box edges plus the bar inset.
    expect(start).toBeCloseTo(171, 0);
    expect(end).toBeCloseTo(1429, 0);
    for (const [startOpen, endOpen] of [
      [false, false],
      [true, false],
      [false, true],
      [true, true],
    ] as const) {
      await q.checkbox("Start sidebar").setChecked(startOpen);
      await q.checkbox("End sidebar").setChecked(endOpen);
      await expectEdges(q.group("Header area"), start, end);
      await expectEdges(q.group("Footer area"), start, end);
      const [partStart, partEnd] = await getOuterEdges(
        q.group("Area start"),
        q.group("Area end"),
      );
      expect(partStart).toBeCloseTo(start, 0);
      expect(partEnd).toBeCloseTo(end, 0);
      // The parts share one row and the center part stays on the box's middle.
      const area = await getBox(q.group("Header area"));
      for (const name of ["Area start", "Area center", "Area end"]) {
        const part = await getBox(q.group(name));
        expect(part.y).toBeCloseTo(area.y, 0);
      }
      await expectCentered(
        q.group("Area center"),
        page.locator(".shell-header").first(),
      );
    }
  });

  test("lines up the bar parts with the sidebar items in RTL", async ({
    q,
    page,
  }) => {
    await q.checkbox("Right to left").check();
    const [start, end] = await getOuterEdges(
      q.group("End items"),
      q.group("Start items"),
    );
    expect(start).toBeCloseTo(171, 0);
    expect(end).toBeCloseTo(1429, 0);
    await expectEdges(q.group("Header area"), start, end);
    await expectEdges(q.group("Footer area"), start, end);
    const [partStart, partEnd] = await getOuterEdges(
      q.group("Area end"),
      q.group("Area start"),
    );
    expect(partStart).toBeCloseTo(start, 0);
    expect(partEnd).toBeCloseTo(end, 0);
    await expectEdges(page.locator(".shell-header").first(), 0, 1600);
  });

  test("keeps the box centered beside an app sidebar", async ({ q, page }) => {
    await page.setViewportSize({ width: 1900, height: 900 });
    await q.checkbox("App sidebar").check();
    const app = await getBox(getSidebar(q, "App sidebar"));
    const [start, end] = await getOuterEdges(
      q.group("Start items"),
      q.group("End items"),
    );
    // The box is centered in the space beside the app sidebar.
    const cellCenter = (app.x + app.width + 1900) / 2;
    expect((start + end) / 2).toBeCloseTo(cellCenter, 0);
    await expectEdges(q.group("Header area"), start, end);
    await expectEdges(q.group("Footer area"), start, end);
    await expectEdges(page.locator(".shell-header").first(), 0, 1900);
  });

  test("keeps the box when the inner shell sets its own width", async ({
    q,
  }) => {
    await q.checkbox("Inner max width").check();
    // The inner shell's 36rem sets its column, and the box stays 80rem.
    await expect
      .poll(async () => (await getBox(q.group("Body column"))).width)
      .toBeCloseTo(576, 0);
    const [start, end] = await getOuterEdges(
      getSidebar(q, "Start sidebar"),
      getSidebar(q, "End sidebar"),
    );
    expect(start).toBeCloseTo(160, 0);
    expect(end).toBeCloseTo(1440, 0);
    const [itemsStart, itemsEnd] = await getOuterEdges(
      q.group("Start items"),
      q.group("End items"),
    );
    await expectEdges(q.group("Header area"), itemsStart, itemsEnd);
  });

  test("spans the inner shell with its header and starts its parts at the box", async ({
    q,
  }) => {
    await q.checkbox("Inner header").check();
    await expectEdges(q.banner("Inner header"), 0, 1600);
    const [start, end] = await getOuterEdges(
      q.group("Start items"),
      q.group("End items"),
    );
    const [partStart, partEnd] = await getOuterEdges(
      q.group("Inner start"),
      q.group("Inner end"),
    );
    expect(partStart).toBeCloseTo(171, 0);
    expect(partStart).toBeCloseTo(start, 0);
    expect(partEnd).toBeCloseTo(end, 0);
    // The sidebars start below the inner header.
    const header = await getBox(q.banner("Inner header"));
    const sidebar = await getBox(getSidebar(q, "Start sidebar"));
    expect(sidebar.y).toBeCloseTo(header.y + header.height, 0);
  });

  test("keeps parts outside the area at the bar edges", async ({ q }) => {
    await q.checkbox("Edge parts").check();
    const [edgeStart, edgeEnd] = await getOuterEdges(
      q.group("Edge start"),
      q.group("Edge end"),
    );
    // The bar inset from the page edges.
    expect(edgeStart).toBeCloseTo(11, 0);
    expect(edgeEnd).toBeCloseTo(1589, 0);
    const [start, end] = await getOuterEdges(
      q.group("Start items"),
      q.group("End items"),
    );
    await expectEdges(q.group("Header area"), start, end);
  });

  test("lines up the bar areas with main's column without a nested shell", async ({
    q,
  }) => {
    await q.checkbox("Nested shell").uncheck();
    const column = q.group("Body column");
    await expect
      .poll(async () => (await getBox(column)).width)
      .toBeCloseTo(1280, 0);
    await expectAligned(q.group("Header area"), column);
    await expectAligned(q.group("Footer area"), column);
    const area = await getBox(q.group("Header area"));
    const [partStart, partEnd] = await getOuterEdges(
      q.group("Area start"),
      q.group("Area end"),
    );
    expect(partStart).toBeCloseTo(area.x, 0);
    expect(partEnd).toBeCloseTo(area.x + area.width, 0);
    await expectEdges(q.group("Body band"), 0, 1600);
  });

  test("starts the box at the page edges below its width", async ({
    q,
    page,
  }) => {
    await page.setViewportSize({ width: 1000, height: 900 });
    const [start, end] = await getOuterEdges(
      getSidebar(q, "Start sidebar"),
      getSidebar(q, "End sidebar"),
    );
    expect(start).toBe(0);
    expect(end).toBeCloseTo(1000, 0);
    const [itemsStart, itemsEnd] = await getOuterEdges(
      q.group("Start items"),
      q.group("End items"),
    );
    await expectEdges(q.group("Header area"), itemsStart, itemsEnd);
    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    expect(scrollWidth).toBe(1000);
  });

  test("keeps the sidebars at the page edges without a max width", async ({
    q,
  }) => {
    await q.checkbox("Max width").uncheck();
    const [start, end] = await getOuterEdges(
      getSidebar(q, "Start sidebar"),
      getSidebar(q, "End sidebar"),
    );
    expect(start).toBe(0);
    expect(end).toBeCloseTo(1600, 0);
  });

  test("gives a shell in the inner shell a box only from the inner width", async ({
    q,
  }) => {
    await q.checkbox("Third level").check();
    const startSidebar = await getBox(getSidebar(q, "Start sidebar"));
    const endSidebar = await getBox(getSidebar(q, "End sidebar"));
    const cellStart = startSidebar.x + startSidebar.width;
    // Without its own width, the inner shell doesn't pass the outer one down.
    await expect
      .poll(async () => (await getBox(getSidebar(q, "Third sidebar"))).x)
      .toBeCloseTo(cellStart, 0);
    await q.checkbox("Inner max width").check();
    // With 36rem on the inner shell, the third shell centers a 576px box in the
    // inner shell's main cell.
    const offset = (endSidebar.x - cellStart - 576) / 2;
    await expect
      .poll(async () => (await getBox(getSidebar(q, "Third sidebar"))).x)
      .toBeCloseTo(cellStart + offset, 0);
    // The outer box doesn't change.
    const [start, end] = await getOuterEdges(
      getSidebar(q, "Start sidebar"),
      getSidebar(q, "End sidebar"),
    );
    expect(start).toBeCloseTo(160, 0);
    expect(end).toBeCloseTo(1440, 0);
  });

  test("uses a number max width as quarters of the shell's text", async ({
    q,
  }) => {
    await q.checkbox("Number max width").check();
    // 320 quarters of the shell's 14px text make a 1120px box.
    await expect
      .poll(async () => (await getBox(getSidebar(q, "Start sidebar"))).x)
      .toBeCloseTo(240, 0);
    const end = await getBox(getSidebar(q, "End sidebar"));
    expect(end.x + end.width).toBeCloseTo(1360, 0);
  });

  test("keeps the parts of an area apart on narrow pages", async ({
    q,
    page,
  }) => {
    await q.checkbox("Long parts").check();
    await page.setViewportSize({ width: 400, height: 900 });
    const [start, center, end] = await Promise.all([
      getBox(q.group("Area start")),
      getBox(q.group("Area center")),
      getBox(q.group("Area end")),
    ]);
    expect(start.x + start.width).toBeLessThanOrEqual(center.x + 0.5);
    expect(center.x + center.width).toBeLessThanOrEqual(end.x + 0.5);
  });

  test("stacks the center part of an area on narrow headers", async ({
    q,
    page,
  }) => {
    await q.checkbox("Stack center").check();
    await q.checkbox("Edge parts").check();
    await page.setViewportSize({ width: 500, height: 900 });
    await expect
      .poll(async () => {
        const [start, center] = await Promise.all([
          getBox(q.group("Area start")),
          getBox(q.group("Area center")),
        ]);
        return center.y - (start.y + start.height);
      })
      .toBeGreaterThanOrEqual(0);
    await expectCentered(q.group("Area center"), q.group("Header area"));
    // Parts outside the area stay on the row of its start and end parts.
    const middle = async (name: string) => {
      const box = await getBox(q.group(name));
      return box.y + box.height / 2;
    };
    expect(await middle("Edge start")).toBeCloseTo(
      await middle("Area start"),
      0,
    );
    expect(await middle("Edge end")).toBeCloseTo(await middle("Area end"), 0);
  });

  test("fills the header's height with navigation in an area", async ({
    q,
    page,
  }) => {
    await q.checkbox("Navigation in the area").check();
    const header = page.locator(".shell-header").first();
    const nav = q.navigation("Header links");
    await expect(nav).toBeVisible();
    await expect
      .poll(async () => {
        const [navBox, headerBox] = await Promise.all([
          getBox(nav),
          getBox(header),
        ]);
        return Math.abs(navBox.y - headerBox.y);
      })
      .toBeLessThan(1);
    expect((await getBox(nav)).height).toBeGreaterThan(
      (await getBox(header)).height - 2,
    );
    // The current link's bar meets the header's inner edge.
    const bar = query(nav).link("Guides").locator(".control-bar");
    await expect
      .poll(async () => {
        const [barBox, navBox] = await Promise.all([getBox(bar), getBox(nav)]);
        return barBox.y + barBox.height - (navBox.y + navBox.height);
      })
      .toBeCloseTo(0, 0);
  });

  test("starts the header area where a custom bar padding puts the inner header's parts", async ({
    q,
  }) => {
    await q.checkbox("Inner header").check();
    await q.checkbox("Bar padding").check();
    const [start, end] = await getOuterEdges(
      q.group("Inner start"),
      q.group("Inner end"),
    );
    // The 16px padding inside the box, which spans 160 to 1440.
    expect(start).toBeCloseTo(176, 0);
    expect(end).toBeCloseTo(1424, 0);
    await expectEdges(q.group("Header area"), start, end);
  });

  test("lines up an area in the inner header with the inner column", async ({
    q,
  }) => {
    await q.checkbox("Inner header").check();
    const column = q.group("Body column");
    await expectAligned(q.group("Inner header area"), column);
    await q.checkbox("Start sidebar").uncheck();
    await expectAligned(q.group("Inner header area"), column);
  });
});
