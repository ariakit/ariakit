import type { Locator } from "@playwright/test";
import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";
import {
  expectCentered,
  getBox,
  getSidebar,
  selectScenario,
} from "./test-helpers.ts";

/** Waits until both edges of `part` are on the edges of `target`. */
async function expectAligned(part: Locator, target: Locator) {
  await expect
    .poll(async () => {
      const [partBox, targetBox] = await Promise.all([
        getBox(part),
        getBox(target),
      ]);
      const start = Math.abs(partBox.x - targetBox.x);
      const end = Math.abs(
        partBox.x + partBox.width - (targetBox.x + targetBox.width),
      );
      return Math.max(start, end);
    })
    .toBeLessThan(0.5);
}

withFramework(import.meta.dirname, async ({ test }) => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ q }) => {
    await selectScenario(q, "areas");
  });

  for (const band of ["content", "popout", "feature"]) {
    test(`aligns ${band} areas with the body for each sidebar state`, async ({
      q,
    }) => {
      await q.combobox("Band").selectOption(band);
      const body = q.group("Body band");
      for (const [start, end] of [
        [false, false],
        [true, false],
        [false, true],
        [true, true],
      ] as const) {
        await q.checkbox("Start sidebar").setChecked(start);
        await q.checkbox("End sidebar").setChecked(end);
        await expectAligned(q.group("Header area"), body);
        await expectAligned(q.group("Footer area"), body);
        // The main header starts after a sidebar, so the side parts take room
        // from a feature band beside one.
        if (band === "feature" && (start || end)) continue;
        await expectAligned(q.group("Main header area"), body);
      }
    });

    // The popout and feature tracks shrink at these widths, so the bars have to
    // share free space the same way as main.
    for (const width of [900, 800, 760, 720, 700]) {
      test(`aligns ${band} areas with no side parts at ${width}px`, async ({
        q,
        page,
      }) => {
        await page.setViewportSize({ width, height: 900 });
        await q.combobox("Band").selectOption(band);
        await q.checkbox("Start sidebar").uncheck();
        await q.checkbox("Bar side parts").uncheck();
        await q.checkbox("Main header side parts").uncheck();
        const body = q.group("Body band");
        await expectAligned(q.group("Header area"), body);
        await expectAligned(q.group("Footer area"), body);
        await expectAligned(q.group("Main header area"), body);
      });
    }
  }

  test("aligns areas with the body in RTL", async ({ q }) => {
    await q.checkbox("Right to left").check();
    await q.checkbox("End sidebar").check();
    const body = q.group("Body band");
    await expectAligned(q.group("Header area"), body);
    await expectAligned(q.group("Footer area"), body);
    await expectAligned(q.group("Main header area"), body);
  });

  test("aligns wide areas with the body when the bars have no side parts", async ({
    q,
  }) => {
    await q.combobox("Band").selectOption("wide");
    await q.checkbox("Bar side parts").uncheck();
    await q.checkbox("Main header side parts").uncheck();
    const body = q.group("Body band");
    await expectAligned(q.group("Header area"), body);
    await expectAligned(q.group("Footer area"), body);
    await expectAligned(q.group("Main header area"), body);
  });

  test("fills the space between the side parts with a full area", async ({
    q,
    page,
  }) => {
    await q.combobox("Band").selectOption("full");
    const area = await getBox(q.group("Header area"));
    const start = await getBox(
      page.locator(".shell-header > .shell-bar-start"),
    );
    const end = await getBox(page.locator(".shell-header > .shell-bar-end"));
    expect(area.x).toBeGreaterThan(start.x + start.width);
    expect(area.x - (start.x + start.width)).toBeLessThan(16);
    expect(end.x - (area.x + area.width)).toBeLessThan(16);
    expect(end.x - (area.x + area.width)).toBeGreaterThan(0);
  });

  test("moves only the edge next to a wide side part", async ({ q, page }) => {
    await page.setViewportSize({ width: 1000, height: 900 });
    await q.checkbox("Start sidebar").uncheck();
    // The area stays on the column during the fold, so wait for its end before
    // reading positions once.
    await expect(getSidebar(q, "Start sidebar")).toHaveCSS("width", "0px");
    const column = q.group("Body column");
    await expectAligned(q.group("Header area"), column);
    await q.combobox("Start part").selectOption("long");
    for (const [name, parent] of [
      ["Header area", ".shell-header"],
      ["Main header area", ".shell-main-header"],
    ] as const) {
      const area = q.group(name);
      const body = await getBox(column);
      const box = await getBox(area);
      const start = await getBox(page.locator(`${parent} > .shell-bar-start`));
      expect(box.x - body.x).toBeGreaterThan(50);
      expect(Math.abs(box.x + box.width - (body.x + body.width))).toBeLessThan(
        0.5,
      );
      expect(box.x - (start.x + start.width)).toBeGreaterThan(0);
      expect(box.x - (start.x + start.width)).toBeLessThan(16);
    }
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
      .toBe(1000);
  });

  test("keeps a wide part from moving an area that has room", async ({
    q,
    page,
  }) => {
    await q.checkbox("Start sidebar").uncheck();
    await q.combobox("Start part").selectOption("long");
    await expect(
      page.locator(".shell-header > .shell-bar-start"),
    ).toBeVisible();
    await expectAligned(q.group("Header area"), q.group("Body column"));
    await expectAligned(q.group("Main header area"), q.group("Body column"));
  });

  test("stops a shrinking side part at the column", async ({ q, page }) => {
    await page.setViewportSize({ width: 1000, height: 900 });
    await q.checkbox("Start sidebar").uncheck();
    await q.combobox("Start part").selectOption("long");
    await q.checkbox("Shrink start part").check();
    await expectAligned(q.group("Header area"), q.group("Body column"));
    // The part keeps its space to the area when it reaches the limit.
    for (const [name, parent] of [
      ["Header area", ".shell-header"],
      ["Main header area", ".shell-main-header"],
    ] as const) {
      const start = await getBox(page.locator(`${parent} > .shell-bar-start`));
      const area = await getBox(q.group(name));
      expect(area.x - (start.x + start.width)).toBeGreaterThan(4);
    }
  });

  test("stops a shrinking end part at the column", async ({ q, page }) => {
    await page.setViewportSize({ width: 1000, height: 900 });
    await q.checkbox("Start sidebar").uncheck();
    await q.checkbox("Shrink end part").check();
    await expectAligned(q.group("Header area"), q.group("Body column"));
    for (const [name, parent] of [
      ["Header area", ".shell-header"],
      ["Main header area", ".shell-main-header"],
    ] as const) {
      const end = await getBox(page.locator(`${parent} > .shell-bar-end`));
      const area = await getBox(q.group(name));
      expect(end.x - (area.x + area.width)).toBeGreaterThan(4);
    }
  });

  test("keeps a shrinking side part at its minimum width", async ({
    q,
    page,
  }) => {
    await q.checkbox("Start sidebar").uncheck();
    await q.combobox("Start part").selectOption("long");
    await q.checkbox("Shrink start part").check();
    await q.checkbox("Area minimum width").check();
    await page.setViewportSize({ width: 320, height: 900 });
    for (const parent of [".shell-header", ".shell-main-header"]) {
      const start = page.locator(`${parent} > .shell-bar-start`);
      await expect.poll(async () => (await getBox(start)).width).toBe(160);
    }
  });

  test("keeps an area at its minimum width", async ({ q, page }) => {
    await page.setViewportSize({ width: 500, height: 900 });
    await q.checkbox("Start sidebar").uncheck();
    await q.combobox("Start part").selectOption("long");
    for (const name of ["Header area", "Main header area"]) {
      const area = q.group(name);
      await q.checkbox("Area minimum width").uncheck();
      await expect
        .poll(async () => (await getBox(area)).width)
        .toBeLessThan(160);
      await q.checkbox("Area minimum width").check();
      await expect.poll(async () => (await getBox(area)).width).toBe(160);
    }
  });

  for (const height of ["sm", "lg"] as const) {
    test(`matches main on big pages and uses the bar inset on small pages at ${height} height`, async ({
      q,
      page,
    }) => {
      await q.combobox("Bar height").selectOption(height);
      await q.checkbox("Bar side parts").uncheck();
      await q.checkbox("Main header side parts").uncheck();
      const column = q.group("Body column");
      const headerArea = q.group("Header area");
      const mainArea = q.group("Main header area");
      await expectAligned(headerArea, column);
      await expectAligned(mainArea, column);
      await q.checkbox("Start sidebar").uncheck();
      await page.setViewportSize({ width: 500, height: 900 });
      const inset = height === "sm" ? 8 : 15;
      await expect.poll(async () => (await getBox(mainArea)).x).toBe(inset);
      await expect.poll(async () => (await getBox(headerArea)).x).toBe(inset);
      await expect(mainArea).toHaveCSS("width", `${500 - inset * 2}px`);
    });
  }

  test("aligns with a published main size", async ({ q }) => {
    await q.checkbox("Start sidebar").uncheck();
    for (const size of ["sm", "md", "lg"]) {
      await q.combobox("Main size").selectOption(size);
      await expectAligned(q.group("Header area"), q.group("Body band"));
      await expectAligned(q.group("Main header area"), q.group("Body band"));
    }
  });

  test("publishes the main size from a directly nested shell", async ({
    q,
  }) => {
    await q.checkbox("Directly nested shell").check();
    await q.combobox("Main size").selectOption("lg");
    await q.checkbox("Start sidebar").uncheck();
    const area = q.group("Header area");
    // The large column is wider than the default 672px one.
    await expect
      .poll(async () => (await getBox(area)).width)
      .toBeGreaterThan(700);
    await expectAligned(area, q.group("Body band"));
  });

  test("places an area that renders later on the column at once", async ({
    q,
    page,
  }) => {
    await q.checkbox("Area in the header").uncheck();
    await expect(q.group("Header area")).toHaveCount(0);
    await q.checkbox("Area in the header").check();
    const animations = await page
      .locator(".shell-header")
      .evaluate((header) => header.getAnimations().length);
    expect(animations).toBe(0);
    await expectAligned(q.group("Header area"), q.group("Body column"));
  });

  for (const height of ["sm", "md", "lg"]) {
    test(`keeps a cover child on the main header's edges at ${height} height`, async ({
      q,
      page,
    }) => {
      await page.setViewportSize({ width: 500, height: 900 });
      await q.checkbox("Start sidebar").uncheck();
      await q.combobox("Bar height").selectOption(height);
      await q.checkbox("Main header side parts").uncheck();
      await q.checkbox("Cover child in the main header").check();
      await expect
        .poll(async () => {
          const box = await getBox(q.navigation("Cover"));
          return [box.x, box.width];
        })
        .toEqual([0, 500]);
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
        .toBe(500);
    });

    test(`removes the main header's space with no gutter at ${height} height`, async ({
      q,
      page,
    }) => {
      await page.setViewportSize({ width: 500, height: 900 });
      await q.checkbox("Start sidebar").uncheck();
      await q.combobox("Bar height").selectOption(height);
      await q.checkbox("Main header side parts").uncheck();
      await q.checkbox("No main header gutter").check();
      await expect
        .poll(async () => (await getBox(q.group("Main header area"))).x)
        .toBe(0);
    });
  }

  test("aligns with main's column and gutter through bar props", async ({
    q,
    page,
  }) => {
    await q.checkbox("Custom column").check();
    await expectAligned(q.group("Header area"), q.group("Body band"));
    await expectAligned(q.group("Footer area"), q.group("Body band"));
    await q.checkbox("Custom column").uncheck();
    await q.checkbox("Custom gutter").check();
    await q.checkbox("Start sidebar").uncheck();
    await q.checkbox("Bar side parts").uncheck();
    // The gutter only shows when the column runs out of room and an end sidebar
    // offsets it.
    await q.checkbox("End sidebar").check();
    await page.setViewportSize({ width: 1100, height: 900 });
    await expectAligned(q.group("Header area"), q.group("Body band"));
    await expectAligned(q.group("Footer area"), q.group("Body band"));
  });

  for (const from of ["main", "body"]) {
    test(`aligns the main header area with an end sidebar from ${from}`, async ({
      q,
      page,
    }) => {
      await q.combobox("End sidebar starts at").selectOption(from);
      await q.checkbox("End sidebar").check();
      await expect(getSidebar(q, "End sidebar")).toHaveCSS("width", "256px");
      await expectAligned(q.group("Main header area"), q.group("Body band"));
      const header = await getBox(page.locator(".shell-main-header"));
      const end = await getBox(
        page.locator(".shell-main-header > .shell-bar-end"),
      );
      const sidebar = await getBox(getSidebar(q, "End sidebar"));
      // The header's surface spans an end sidebar that starts at the body, and
      // the End part stays at the edge of that surface.
      expect(header.x + header.width).toBeCloseTo(
        from === "body" ? sidebar.x + sidebar.width : sidebar.x,
        0,
      );
      expect(header.x + header.width - (end.x + end.width)).toBeCloseTo(11, 0);
    });
  }

  test("keeps areas on the column throughout a fold", async ({ q, page }) => {
    await expect(getSidebar(q, "Start sidebar")).toHaveCSS("width", "320px");
    // A new shell can animate its lengths in some browsers, which could start a
    // part's motion before the fold that this samples.
    await expect
      .poll(() => page.evaluate(() => document.getAnimations().length))
      .toBe(0);
    await using input = await q.checkbox("Start sidebar").elementHandle();
    const largest = await page.evaluate(async (input) => {
      if (!(input instanceof HTMLInputElement)) {
        throw new Error("Missing toggle");
      }
      const getElement = (name: string) => {
        const element = document.querySelector(`[aria-label="${name}"]`);
        if (!element) {
          throw new Error(`Missing ${name}`);
        }
        return element;
      };
      const column = getElement("Body column");
      const parts = ["Header area", "Footer area", "Main header area"].map(
        getElement,
      );
      input.click();
      let largest = 0;
      const start = performance.now();
      while (performance.now() - start < 500) {
        await new Promise(requestAnimationFrame);
        const columnBox = column.getBoundingClientRect();
        for (const part of parts) {
          const box = part.getBoundingClientRect();
          largest = Math.max(
            largest,
            Math.abs(box.left - columnBox.left),
            Math.abs(box.right - columnBox.right),
          );
        }
      }
      return largest;
    }, input);
    expect(largest).toBeLessThan(0.5);
  });

  test("keeps a plain child on the column between side parts", async ({
    q,
  }) => {
    await q.combobox("Middle part").selectOption("plain");
    const plain = q.main().getByLabel("Plain child");
    await expectAligned(plain, q.group("Body column"));
  });

  test("keeps a plain child on the column with no side parts", async ({
    q,
  }) => {
    await q.combobox("Middle part").selectOption("plain");
    await q.checkbox("Main header side parts").uncheck();
    const plain = q.main().getByLabel("Plain child");
    await expectAligned(plain, q.group("Body column"));
  });

  test("keeps Center on the middle of the main header", async ({ q, page }) => {
    const header = page.locator(".shell-main-header");
    await q.combobox("Middle part").selectOption("center");
    await expectCentered(q.main().getByLabel("Main header center"), header);
    await q.combobox("Middle part").selectOption("grow");
    const center = page.locator(".shell-main-header > .shell-bar-center");
    await expectCentered(center, header);
    const box = await getBox(center);
    const headerBox = await getBox(header);
    expect(box.width).toBeGreaterThan(headerBox.width / 3);
  });

  test("wraps a long center part instead of overflowing the page", async ({
    q,
    page,
  }) => {
    await q.checkbox("Start sidebar").uncheck();
    await q.combobox("Middle part").selectOption("long center");
    await page.setViewportSize({ width: 320, height: 900 });
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
      .toBe(320);
    const end = await getBox(
      page.locator(".shell-main-header > .shell-bar-end"),
    );
    expect(end.x + end.width).toBeLessThanOrEqual(320);
  });

  test("fills the main header's height with navigation", async ({
    q,
    page,
  }) => {
    await q.checkbox("Navigation in the main header").check();
    const header = page.locator(".shell-main-header");
    const nav = q.navigation("Local");
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
  });

  test("aligns areas with the body of their own shell", async ({ q }) => {
    await q.checkbox("Nested shell").check();
    const inner = q.group("Inner body column");
    await expectAligned(q.group("Inner header area"), inner);
    await expectAligned(q.group("Inner main header area"), inner);
    await expectAligned(q.group("Header area"), q.group("Body band"));
    await q.checkbox("Start sidebar").uncheck();
    await expectAligned(q.group("Inner header area"), inner);
    await expectAligned(q.group("Inner main header area"), inner);
    await expectAligned(q.group("Header area"), q.group("Body band"));
  });
});
