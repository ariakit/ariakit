import { withFramework } from "#app/test-utils/preview.ts";

withFramework(
  import.meta.dirname,
  { route: "table" },
  async ({ test, query }) => {
    // The sort button covers its header cell, and the cell at the table's
    // corner is rounded with the container. A square ring would run into the
    // corner and be cut off by the container's clip.
    test("rounds a corner sort button's focus ring with the table", async ({
      page,
      q,
    }) => {
      const table = query(q.article("Sortable headers"));
      const corner = table.button("Component");
      const middle = table.button("Status");
      // Script focus alone does not put every engine in keyboard modality, so
      // the ring is reached with a real Tab press.
      await corner.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      await test.expect(corner).toBeFocused();
      await test.expect(corner).toHaveCSS("outline-style", "solid");
      // The container's xl radius less its 1px border, as on the cell.
      await test.expect(corner).toHaveCSS("border-start-start-radius", "11px");
      await test.expect(corner).toHaveCSS("border-end-start-radius", "0px");
      await test.expect(middle).toHaveCSS("border-start-start-radius", "0px");
    });

    test("draws a focused cell's ring inside the cell", async ({ page, q }) => {
      const grid = query(q.article("Selected rows"));
      const cell = grid.rowheader("Glider");
      await test.expect(cell).not.toHaveCSS("box-shadow", /2px inset/);
      await grid.checkbox("Select all rows").focus();
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("ArrowRight");
      await test.expect(cell).toBeFocused();
      // An inset ring fills the padding box, inside the lines the cell draws.
      await test.expect(cell).toHaveCSS("box-shadow", /2px inset/);
      await test.expect(cell).toHaveCSS("outline-style", "none");
      await test
        .expect(grid.row(/\bGlider\b/))
        .toHaveAttribute("aria-selected", "true");
    });

    test("draws a focused row's ring around its cells", async ({ page, q }) => {
      const grid = query(q.article("Focusable rows"));
      const first = grid.row(/^Button /);
      const last = grid.row(/^Table /);
      const getRing = (row: typeof first) =>
        row.evaluate((element) => {
          const style = getComputedStyle(element, "::after");
          return {
            position: style.position,
            inset: [style.top, style.right, style.bottom, style.left],
            width: style.borderTopWidth,
            radius: [
              style.borderTopLeftRadius,
              style.borderTopRightRadius,
              style.borderBottomRightRadius,
              style.borderBottomLeftRadius,
            ],
            zIndex: style.zIndex,
          };
        });
      await first.focus();
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("ArrowUp");
      await test.expect(first).toBeFocused();
      // The ring lies over the cells and stops at the line below the row, which
      // its cells draw.
      test.expect(await getRing(first)).toEqual({
        position: "absolute",
        inset: ["0px", "0px", "1px", "0px"],
        width: "2px",
        radius: ["0px", "0px", "0px", "0px"],
        zIndex: "2",
      });
      await page.keyboard.press("End");
      await test.expect(last).toBeFocused();
      // The last row draws no line below it, and its ring follows the
      // container's rounded bottom corners inside its 1px border.
      test.expect(await getRing(last)).toEqual({
        position: "absolute",
        inset: ["0px", "0px", "0px", "0px"],
        width: "2px",
        radius: ["0px", "0px", "11px", "11px"],
        zIndex: "2",
      });
    });
  },
);
