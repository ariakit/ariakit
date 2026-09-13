import type { Locator } from "@playwright/test";
import { PNG } from "pngjs";
import {
  captureInView,
  capturePage,
  expectFocusVisible,
  forEachColorScheme,
  getCapture,
  hoverOver,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

function getEdgePattern(value: string) {
  return new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
}

function getDocumentBounds(element: Locator) {
  return element.evaluate((node) => {
    const bounds = node.getBoundingClientRect();
    return {
      x: bounds.x + window.scrollX,
      y: bounds.y + window.scrollY,
      width: bounds.width,
      height: bounds.height,
    };
  });
}

withCaptures(import.meta.dirname, async ({ query, test }) => {
  // https://github.com/ariakit/ariakit/issues/7481
  test("colors grid lines through custom and disabled cell layers", async ({
    page,
    q,
  }) => {
    await forEachColorScheme(page, async () => {
      const fixture = query(q.article("Colored cell layers"));
      const grid = fixture.grid();
      const edge = await grid
        .locator("xpath=../..")
        .evaluate((node) => getComputedStyle(node).borderTopColor);
      const edgePattern = getEdgePattern(edge);
      for (const selected of [false, true]) {
        await fixture.checkbox("Select row").setChecked(selected);
        await hoverOver(query(grid).text("Disabled surface"));
        for (const cell of await query(grid).row().locator("td").all()) {
          await test.expect(cell).toHaveCSS("border-image-source", edgePattern);
        }
      }
    });
  });

  // https://github.com/ariakit/ariakit/issues/7481
  test("uses container edge colors for grid lines and table overrides", async ({
    page,
    q,
  }) => {
    await forEachColorScheme(page, async () => {
      for (const title of ["Brand grid lines", "Grid edge override"]) {
        const table = query(q.article(title)).table();
        const container = table.locator("xpath=../..");
        const edge = await (
          title === "Brand grid lines" ? container : table
        ).evaluate((node) => getComputedStyle(node).borderTopColor);
        for (const cell of await table.locator("th, td").all()) {
          await test
            .expect(cell)
            .toHaveCSS("border-image-source", getEdgePattern(edge));
        }
        const row = query(table).row(/^Button /);
        await hoverOver(row);
        await test
          .expect(query(row).cell().first())
          .toHaveCSS("border-image-source", getEdgePattern(edge));
      }
    });
  });

  // https://github.com/ariakit/ariakit/issues/7481
  test("preserves explicit raw cell edges over table defaults", async ({
    page,
    q,
  }) => {
    await forEachColorScheme(page, async () => {
      const fixture = query(q.article("Cell edge override"));
      await fixture.checkbox("Show all borders on Failed cells").uncheck();
      for (const name of ["Plain cell edges", "Colored cell edges"]) {
        const cell = query(fixture.table(name)).cell("Failed");
        const color = await cell
          .locator("span")
          .evaluate((node) => getComputedStyle(node).color);
        await test
          .expect(cell)
          .toHaveCSS("border-image-source", getEdgePattern(color));
      }
    });
  });

  test("shares cell border geometry with focus without adding hover edges @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Cell edge override");
      const fixture = query(box);
      const checkbox = fixture.checkbox("Show all borders on Failed cells");
      await checkbox.check();
      for (const name of ["Plain cell edges", "Colored cell edges"]) {
        const table = query(fixture.table(name));
        const cell = table.cell("Failed");
        const color = await cell
          .locator("span")
          .evaluate((node) => getComputedStyle(node).color);
        await test.expect(cell).toHaveCSS("outline-style", "none");
        await test
          .expect(cell)
          .toHaveCSS("box-shadow", /0px 0px 0px 1px inset/);
        await test.expect(cell).toHaveCSS("box-shadow", getEdgePattern(color));
        await test
          .expect(table.cell("Pending"))
          .not.toHaveCSS("box-shadow", /0px 0px 0px [1-9]\d*px inset/);
        await test
          .expect(table.cell("Needs review"))
          .toHaveCSS("box-shadow", /0px 0px 0px 1px inset/);
        await test
          .expect(table.cell("Ready to test"))
          .toHaveCSS("box-shadow", /0px 0px 0px 1px inset/);
        await test
          .expect(table.cell("Warning"))
          .toHaveCSS("box-shadow", /0px 0px 0px 2px inset/);

        const bounds = await getDocumentBounds(cell.locator("span"));
        await checkbox.uncheck();
        await test.expect(cell).not.toHaveCSS("box-shadow", /inset/);
        await test
          .expect(cell)
          .toHaveCSS("border-image-source", getEdgePattern(color));
        test
          .expect(await getDocumentBounds(cell.locator("span")))
          .toEqual(bounds);
        await checkbox.check();
        await test
          .expect(cell)
          .toHaveCSS("box-shadow", /0px 0px 0px 1px inset/);
        await hoverOver(cell);
        // Only the inset border uses the cell color. The grid and the shadow
        // above a hovered row retain the same paint as the neighboring cell.
        const grid = await table
          .cell("Needs review")
          .evaluate((node) => getComputedStyle(node).borderImageSource);
        await test.expect(cell).toHaveCSS("border-image-source", grid);
        const shadow = await cell.evaluate(
          (node) => getComputedStyle(node).boxShadow,
        );
        test
          .expect(shadow.match(new RegExp(getEdgePattern(color), "g")))
          .toHaveLength(1);
      }
      await visual(getCapture(box, colorScheme, { id: "hover" }));

      await checkbox.focus();
      await page.keyboard.press("Tab");
      const table = query(fixture.table("Plain cell edges"));
      await expectFocusVisible(table.cell("Failed"));
      await test
        .expect(table.cell("Failed"))
        .toHaveCSS("outline-style", "none");
      await test.expect(table.cell("Failed")).toHaveCSS("box-shadow", /inset/);
      const color = await table
        .cell("Failed")
        .locator("span")
        .evaluate((node) => getComputedStyle(node).color);
      await test
        .expect(table.cell("Failed"))
        .not.toHaveCSS("box-shadow", getEdgePattern(color));
      await test
        .expect(table.cell("Failed"))
        .toHaveCSS("box-shadow", /0px 0px 0px 2px inset/);
      await visual(getCapture(box, colorScheme, { id: "focus" }));

      await page.keyboard.press("Tab");
      await expectFocusVisible(table.cell("Warning"));
      await test
        .expect(table.cell("Warning"))
        .toHaveCSS("outline-style", "none");
      await test
        .expect(table.cell("Warning"))
        .toHaveCSS("box-shadow", /0px 0px 0px 2px inset/);
      await checkbox.focus();
    });
  });

  test("keeps the grid visible beside colored cell borders", async ({
    page,
    q,
  }) => {
    await forEachColorScheme(page, async () => {
      const box = q.article("Cell edge override");
      const fixture = query(box);
      for (const name of ["Plain cell edges", "Colored cell edges"]) {
        const table = query(fixture.table(name));
        const cell = table.cell("Failed");
        const neighbor = table.cell("Needs review");
        for (const hovered of [false, true]) {
          await hoverOver(hovered ? cell : table.columnheader("Status"));
          const screenshot = PNG.sync.read(
            await box.screenshot({ scale: "css" }),
          );
          const bounds = await getDocumentBounds(box);
          const cellBounds = await getDocumentBounds(cell);
          const neighborBounds = await getDocumentBounds(neighbor);
          const left = Math.round(cellBounds.x - bounds.x);
          const top = Math.round(cellBounds.y - bounds.y);
          const right = Math.round(left + cellBounds.width);
          const bottom = Math.round(top + cellBounds.height);
          const pixel = (x: number, y: number) => {
            const offset = (y * screenshot.width + x) * 4;
            return screenshot.data.subarray(offset, offset + 4);
          };
          const grid = pixel(
            Math.round(neighborBounds.x - bounds.x) + 10,
            bottom - 1,
          );
          const surface = pixel(left + 10, top + 10);
          const expectGrid = (x: number, y: number) => {
            // Compositing the translucent image and shadow can round an 8-bit
            // color channel one step apart across browser engines.
            for (const [index, value] of pixel(x, y).entries()) {
              test
                .expect(Math.abs(value - grid.readUInt8(index)))
                .toBeLessThanOrEqual(1);
            }
          };
          // The normal grid remains outside the colored inset ring. A hover
          // keeps the same grid color above the cell instead of adding red.
          test.expect(grid).not.toEqual(surface);
          expectGrid(left + 10, bottom - 1);
          expectGrid(right - 1, top + 10);
          test.expect(pixel(left + 10, top)).not.toEqual(grid);
          test.expect(pixel(left + 10, top)).not.toEqual(surface);
          if (hovered) {
            expectGrid(left + 10, top - 1);
          }
        }
      }
    });
  });

  test("shares row borders with focus across hover, selection, and pinned cells @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Row edge override");
      const fixture = query(box);
      const checkbox = fixture.checkbox("Show all borders on Failed row");
      const row = fixture.row("Failed Needs review");
      const warning = fixture.row("Warning Check details");
      const pending = fixture.row("Pending Ready to test");
      const getBorder = (row: Locator) =>
        row.evaluate((node) => {
          const style = getComputedStyle(node, "::after");
          return {
            color: style.borderTopColor,
            width: style.borderTopWidth,
            top: style.top,
            bottom: style.bottom,
            zIndex: style.zIndex,
          };
        });
      await checkbox.check();
      const color = await query(row)
        .gridcell("Failed")
        .locator("span")
        .evaluate((node) => getComputedStyle(node).color);
      await test.expect
        .poll(() => getBorder(row))
        .toMatchObject({ color, width: "1px", zIndex: "2" });
      const border = await getBorder(row);
      const bounds = await getDocumentBounds(row);
      await hoverOver(row);
      await fixture.checkbox("Select Failed row").check();
      await test.expect(row).toHaveAttribute("aria-selected", "true");
      test.expect(await getBorder(row)).toEqual(border);
      for (const cell of await query(row).gridcell().all()) {
        await test
          .expect(cell)
          .not.toHaveCSS("box-shadow", getEdgePattern(color));
        await test
          .expect(cell)
          .not.toHaveCSS("border-image-source", getEdgePattern(color));
      }
      await visual(getCapture(box, colorScheme, { id: "selected" }));
      await checkbox.uncheck();
      await test.expect
        .poll(() => getBorder(row))
        .toMatchObject({ width: "0px" });
      test.expect(await getDocumentBounds(row)).toEqual(bounds);
      await test
        .expect(query(row).gridcell("Failed"))
        .toHaveCSS("border-image-source", getEdgePattern(color));
      await checkbox.check();
      await checkbox.focus();
      await page.keyboard.press("Tab");
      await expectFocusVisible(row);
      await test.expect
        .poll(() => getBorder(row))
        .toMatchObject({
          width: "2px",
          top: border.top,
          bottom: border.bottom,
        });
      test.expect((await getBorder(row)).color).not.toBe(color);
      await visual(getCapture(box, colorScheme, { id: "focus" }));
      const warningBorder = await getBorder(warning);
      test.expect(warningBorder.width).toBe("3px");
      await page.keyboard.press("Tab");
      await expectFocusVisible(warning);
      await test.expect
        .poll(() => getBorder(warning))
        .toMatchObject({ width: "1px" });
      test
        .expect((await getBorder(warning)).color)
        .not.toBe(warningBorder.color);
      await page.keyboard.press("Tab");
      await expectFocusVisible(pending);
      await test.expect
        .poll(() => getBorder(pending))
        .toMatchObject({ width: "1px" });
      test.expect(await getBorder(warning)).toEqual(warningBorder);
      await checkbox.focus();
    });
  });

  // https://github.com/ariakit/ariakit/issues/7481
  test("keeps a nested table's grid independent of its outer table", async ({
    q,
  }) => {
    const fixture = query(q.article("Nested table edges"));
    const outer = fixture.table("Project groups");
    const inner = fixture.table("Nested component coverage");
    const outerEdge = await query(outer)
      .columnheader("Project")
      .evaluate((node) => getComputedStyle(node).borderImageSource);
    const innerEdge = await query(inner)
      .columnheader("Component")
      .evaluate((node) => getComputedStyle(node).borderImageSource);
    test.expect(innerEdge).not.toBe(outerEdge);
    test.expect(innerEdge).toContain("/ 0.1)");
  });

  test("keeps outer table corners when a nested table has a footer", async ({
    q,
  }) => {
    const fixture = query(q.article("Nested table edges"));
    const outer = fixture.table("Project groups");
    const inner = fixture.table("Nested component coverage");
    await test.expect(query(inner).cell("Total")).toBeVisible();
    const firstCell = query(outer).cell("Website", { exact: true });
    const lastCell = firstCell.locator("xpath=following-sibling::td");
    for (const cell of [firstCell, lastCell]) {
      await test.expect(cell).toHaveCSS("border-bottom-width", "0px");
    }
    await test.expect(firstCell).toHaveCSS("border-bottom-left-radius", "11px");
    await test.expect(lastCell).toHaveCSS("border-bottom-right-radius", "11px");
    for (const name of ["Button", "Tabs"]) {
      await test
        .expect(query(inner).cell(name))
        .toHaveCSS("border-bottom-width", "1px");
    }
    await test
      .expect(query(inner).cell("Total"))
      .toHaveCSS("border-bottom-width", "0px");
  });

  // https://github.com/ariakit/ariakit/issues/7481
  test("keeps header choices at body size and preserves explicit control sizes", async ({
    q,
  }) => {
    const selected = query(q.article("Selected rows"));
    const size = (element: Locator) =>
      element.evaluate((node) => node.getBoundingClientRect().width);
    test
      .expect(await size(selected.checkbox("Select all rows")))
      .toBe(await size(selected.checkbox("Select Button")));
    const large = query(q.article("Header control sizes"));
    test.expect(await size(large.checkbox("Header choice"))).toBe(20);
    test
      .expect(await size(large.checkbox("Header choice")))
      .toBe(await size(large.checkbox("Body choice")));
    test
      .expect(await size(large.checkbox("Small header choice")))
      .toBe(await size(large.checkbox("Small body choice")));
    test
      .expect(await size(large.checkbox("Small header choice")))
      .toBeLessThan(await size(large.checkbox("Header choice")));
    await test
      .expect(large.button("Edit header"))
      .toHaveCSS("font-size", "12px");
    await test.expect(large.button("Edit row")).toHaveCSS("font-size", "12px");
    test
      .expect(await size(large.button("Edit header").locator("svg")))
      .toBe(await size(large.button("Edit row").locator("svg")));
  });

  // https://github.com/ariakit/ariakit/issues/7481
  test("aligns caption padding with the cells", async ({ q }) => {
    const table = query(q.article("Caption options")).table();
    const caption = query(table).caption();
    await test.expect(caption).toBeVisible();
    const cell = query(table).cell("Button");
    for (const property of [
      "paddingInlineStart",
      "paddingInlineEnd",
      "paddingTop",
      "paddingBottom",
    ] as const) {
      const padding = await cell.evaluate(
        (node, property) => getComputedStyle(node)[property],
        property,
      );
      test
        .expect(
          await caption.evaluate(
            (node, property) => getComputedStyle(node)[property],
            property,
          ),
        )
        .toBe(padding);
    }
  });

  // The narrow containers of the fixture tables let the cells scroll under the
  // pinned ones. A pinned cell must paint the row's surface, which the row
  // shows through the ordinary cells, at rest and in every row state.
  const scrollCellsUnderPinnedCell = async (table: Locator) => {
    const scroller = table.locator("xpath=..");
    const scrollLeft = await scroller.evaluate((node) => {
      node.scrollLeft = node.scrollWidth;
      return node.scrollLeft;
    });
    test.expect(scrollLeft).toBeGreaterThan(0);
  };

  // The page capture also keeps the cell layers and the inherited column styles
  // of the table fixtures under visual regression.
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972228648
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974548937
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974552570
  test("page @visual", async ({ page, visual }) => {
    await forEachColorScheme(page, (colorScheme) =>
      capturePage(page, visual, colorScheme),
    );
  });

  test("draws a focused cell's ring inside the cell @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Selected rows");
      const grid = query(box);
      await grid.checkbox("Select all rows").focus();
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("ArrowRight");
      await expectFocusVisible(grid.rowheader("Glider"));
      await captureInView(visual, box, colorScheme);
    });
  });

  // The last row draws no line below it, and its ring follows the container's
  // rounded bottom corners inside its 1px border.
  test("rounds the ring of the focused last row @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Focusable rows");
      await query(box)
        .row(/^Button /)
        .focus();
      await page.keyboard.press("End");
      await expectFocusVisible(query(box).row(/^Table /));
      await captureInView(visual, box, colorScheme);
    });
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972228648
  test("paints the pinned cell over the cells scrolled under it @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Table cell layer");
      await scrollCellsUnderPinnedCell(query(box).grid());
      await captureInView(visual, box, colorScheme);
    });
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972228648
  test("shows the hovered row through ordinary cells @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Table cell layer");
      await scrollCellsUnderPinnedCell(query(box).grid());
      await hoverOver(query(box).text("Disabled surface"));
      await visual(getCapture(box, colorScheme));
    });
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972228648
  test("shows the selected row through ordinary cells @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Table cell layer");
      await scrollCellsUnderPinnedCell(query(box).grid());
      await query(box).checkbox("Select row").check();
      await test
        .expect(query(box).row())
        .toHaveAttribute("aria-selected", "true");
      await captureInView(visual, box, colorScheme);
    });
  });

  // The head cell sets the pinned column, and the body and foot cells inherit
  // it, so the names stay over the scrolled columns in every row group.
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974552570
  test("keeps the names pinned over the scrolled columns @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Table rows");
      await scrollCellsUnderPinnedCell(query(box).table("Team hours"));
      await captureInView(visual, box, colorScheme);
    });
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974552570
  test("scrolls the names with the columns when they are unpinned @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Table rows");
      const pin = query(box).checkbox("Pin contributor names");
      await pin.uncheck();
      await test.expect(pin).not.toBeChecked();
      await scrollCellsUnderPinnedCell(query(box).table("Team hours"));
      await captureInView(visual, box, colorScheme);
    });
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974552570
  test("keeps missing hours under their header after adding a contributor @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Table rows");
      await query(box).button("Add contributor").click();
      await test.expect(query(box).row(/^Katherine\b/)).toBeVisible();
      await captureInView(visual, box, colorScheme);
    });
  });
});
