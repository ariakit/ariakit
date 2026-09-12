import type { Locator } from "@playwright/test";
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

  test("shows full cell borders for edge variants without moving content @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Cell edge override");
      const fixture = query(box);
      const checkbox = fixture.checkbox("Show all borders on Failed cells");
      const getContentBounds = (cell: Locator) =>
        cell.locator("span").evaluate((node) => {
          const bounds = node.getBoundingClientRect();
          return {
            x: bounds.x + window.scrollX,
            y: bounds.y + window.scrollY,
            width: bounds.width,
            height: bounds.height,
          };
        });
      await checkbox.check();
      for (const name of ["Plain cell edges", "Colored cell edges"]) {
        const table = query(fixture.table(name));
        const cell = table.cell("Failed");
        const color = await cell
          .locator("span")
          .evaluate((node) => getComputedStyle(node).color);
        await test.expect(cell).toHaveCSS("outline-style", "solid");
        await test.expect(cell).toHaveCSS("outline-width", "1px");
        await test.expect(cell).toHaveCSS("outline-offset", "-1px");
        await test.expect(cell).toHaveCSS("outline-color", color);
        await test
          .expect(table.cell("Pending"))
          .toHaveCSS("outline-style", "none");
        await test
          .expect(table.cell("Needs review"))
          .toHaveCSS("outline-width", "1px");
        // A translucent border must replace the grid paint on owned sides, or
        // those sides become darker than the rest of the full border.
        await test
          .expect(table.cell("Needs review"))
          .toHaveCSS("border-image-width", "0");
        await test
          .expect(table.cell("Ready to test"))
          .toHaveCSS("outline-width", "1px");
        await test
          .expect(table.cell("Warning"))
          .toHaveCSS("outline-width", "2px");

        const bounds = await getContentBounds(cell);
        await checkbox.uncheck();
        await test.expect(cell).toHaveCSS("outline-style", "none");
        await test.expect(cell).toHaveCSS("border-image-width", "1");
        test.expect(await getContentBounds(cell)).toEqual(bounds);
        await checkbox.check();
        await test.expect(cell).toHaveCSS("outline-style", "solid");
        await hoverOver(cell);
        await test.expect(cell).toHaveCSS("outline-color", color);
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
      await test
        .expect(table.cell("Failed"))
        .toHaveCSS("border-image-width", "1");
      await visual(getCapture(box, colorScheme, { id: "focus" }));

      await page.keyboard.press("Tab");
      await expectFocusVisible(table.cell("Warning"));
      await test
        .expect(table.cell("Warning"))
        .toHaveCSS("outline-style", "solid");
      await test
        .expect(table.cell("Warning"))
        .toHaveCSS("outline-width", "2px");
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
