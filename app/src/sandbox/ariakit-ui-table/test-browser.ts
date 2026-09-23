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
import { setVisonautItem } from "#app/test-utils/visonaut.ts";

withCaptures(import.meta.dirname, async ({ query, test }) => {
  test("shares cell border geometry with focus without adding hover edges @visual", async ({
    page,
    q,
    visual,
  }) => {
    setVisonautItem(
      "ui/table/test-browser/shares-cell-border-geometry-with-focus-without-adding-hover-edges",
    );
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Cell edge override");
      const fixture = query(box);
      const checkbox = fixture.checkbox("Show all borders on Failed cells");
      await checkbox.check();
      for (const name of ["Plain cell edges", "Colored cell edges"]) {
        await hoverOver(query(fixture.table(name)).cell("Failed"));
      }
      await visual(getCapture(box, colorScheme, { id: "hover" }));
      await checkbox.focus();
      await page.keyboard.press("Tab");
      await expectFocusVisible(
        query(fixture.table("Plain cell edges")).cell("Failed"),
      );
      await visual(getCapture(box, colorScheme, { id: "focus" }));
    });
  });

  test("shares row borders with focus across hover, selection, and pinned cells @visual", async ({
    page,
    q,
    visual,
  }) => {
    setVisonautItem(
      "ui/table/test-browser/shares-row-borders-with-focus-across-hover-selection-and-pinned-cells",
    );
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Row edge override");
      const fixture = query(box);
      const checkbox = fixture.checkbox("Show all borders on Failed row");
      const row = fixture.row("Failed Needs review");
      await checkbox.check();
      await hoverOver(row);
      await fixture.checkbox("Select Failed row").check();
      await test.expect(row).toHaveAttribute("aria-selected", "true");
      await visual(getCapture(box, colorScheme, { id: "selected" }));
      await checkbox.uncheck();
      await checkbox.check();
      await checkbox.focus();
      await page.keyboard.press("Tab");
      await expectFocusVisible(row);
      await visual(getCapture(box, colorScheme, { id: "focus" }));
    });
  });

  // https://github.com/ariakit/ariakit/pull/7498#discussion_r3998333745
  test("paints row borders above pinned cells while scrolling @visual", async ({
    page,
    q,
    visual,
  }) => {
    setVisonautItem(
      "ui/table/test-browser/paints-row-borders-above-pinned-cells-while-scrolling",
    );
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Row edge override");
      const fixture = query(box);
      await fixture.checkbox("Scroll row borders").check();
      const scroller = fixture.grid().locator("xpath=..");
      const cases = [
        { name: "Failed Needs review", cell: "Failed", focus: false },
        { name: "Failed Needs review", cell: "Failed", focus: true },
        {
          name: "Pending Ready to test",
          cell: "Ready to test",
          focus: false,
        },
      ];
      for (const { name, cell, focus } of cases) {
        const row = fixture.row(name);
        await scroller.evaluate((node) => {
          node.scrollLeft = 0;
        });
        await fixture.checkbox("Show all borders on Failed row").focus();
        if (focus) {
          await page.keyboard.press("Tab");
          await row.focus();
          await expectFocusVisible(row);
        }
        await hoverOver(fixture.checkbox("Scroll row borders"));
        await scroller.evaluate((node) => {
          node.scrollLeft = (node.scrollWidth - node.clientWidth) / 2;
        });
        await test.expect
          .poll(() => scroller.evaluate((node) => node.scrollLeft))
          .toBeGreaterThan(0);
        await visual(
          getCapture(box, colorScheme, {
            id: cell + "-" + (focus ? "focus" : "static"),
          }),
        );
      }
    });
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
    setVisonautItem("ui/table/test-browser/page");
    await forEachColorScheme(page, (colorScheme) =>
      capturePage(page, visual, colorScheme),
    );
  });

  test("draws a focused cell's ring inside the cell @visual", async ({
    page,
    q,
    visual,
  }) => {
    setVisonautItem(
      "ui/table/test-browser/draws-a-focused-cells-ring-inside-the-cell",
    );
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
    setVisonautItem(
      "ui/table/test-browser/rounds-the-ring-of-the-focused-last-row",
    );
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
    setVisonautItem(
      "ui/table/test-browser/paints-the-pinned-cell-over-the-cells-scrolled-under-it",
    );
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
    setVisonautItem(
      "ui/table/test-browser/shows-the-hovered-row-through-ordinary-cells",
    );
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
    setVisonautItem(
      "ui/table/test-browser/shows-the-selected-row-through-ordinary-cells",
    );
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
    setVisonautItem(
      "ui/table/test-browser/keeps-the-names-pinned-over-the-scrolled-columns",
    );
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
    setVisonautItem(
      "ui/table/test-browser/scrolls-the-names-with-the-columns-when-they-are-unpinned",
    );
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
    setVisonautItem(
      "ui/table/test-browser/keeps-missing-hours-under-their-header-after-adding-a-contributor",
    );
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Table rows");
      await query(box).button("Add contributor").click();
      await test.expect(query(box).row(/^Katherine\b/)).toBeVisible();
      await captureInView(visual, box, colorScheme);
    });
  });
});
