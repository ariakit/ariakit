import { withFramework } from "#app/test-utils/preview.ts";

withFramework(
  import.meta.dirname,
  { route: "table-fixtures" },
  async ({ test, query }) => {
    // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972228648
    test("shows the row through ordinary cells and paints pinned cells", async ({
      q,
    }) => {
      const fixture = query(q.article("Table cell layer"));
      const row = fixture.row();
      const ordinary = fixture.text("Row surface");
      const pinned = fixture.text("Pinned name");
      const custom = fixture.text("Custom surface");
      const modified = fixture.text("Modified surface");
      const disabled = fixture.text("Disabled surface");
      const selected = fixture.checkbox("Select row");
      // Transparent layers retain their color channels and serialize as OKLCH.
      const transparentColor = /^(?:rgba\(.+, 0\)|oklch\(.+ \/ 0\))$/;
      const expectRowSurface = async () => {
        await test
          .expect(ordinary)
          .toHaveCSS("background-color", transparentColor);
        await test
          .expect(disabled)
          .toHaveCSS("background-color", transparentColor);
        await test.expect
          .poll(async () => {
            const rowBackground = await row.evaluate(
              (element) => getComputedStyle(element).backgroundColor,
            );
            const pinnedBackground = await pinned.evaluate(
              (element) => getComputedStyle(element).backgroundColor,
            );
            return pinnedBackground === rowBackground;
          })
          .toBe(true);
      };
      await test.expect(ordinary).toBeVisible();
      await expectRowSurface();
      const restingBackground = await row.evaluate(
        (element) => getComputedStyle(element).backgroundColor,
      );
      await test
        .expect(pinned)
        .toHaveCSS("background-color", restingBackground);
      await test
        .expect(custom)
        .not.toHaveCSS("background-color", restingBackground);
      // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974548937
      await test
        .expect(modified)
        .not.toHaveCSS("background-color", transparentColor);
      await test
        .expect(modified)
        .not.toHaveCSS("background-color", restingBackground);

      await ordinary.hover();
      await test
        .expect(row)
        .not.toHaveCSS("background-color", restingBackground);
      await expectRowSurface();

      await selected.check();
      await test.expect(row).toHaveAttribute("aria-selected", "true");
      await test
        .expect(row)
        .not.toHaveCSS("background-color", restingBackground);
      await expectRowSurface();
    });

    // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974552570
    test("inherits and updates column styles across the head, body, and footer", async ({
      q,
    }) => {
      const table = query(q.table("Team hours"));
      const names = [
        table.columnheader("Contributor"),
        table.cell("Ada"),
        table.cell("Grace"),
        table.rowheader("Total"),
      ];
      const hours = [
        table.columnheader("Hours"),
        table.cell("12"),
        table.cell("7"),
        table.cell("19"),
      ];

      for (const cell of names) {
        await test.expect(cell).toHaveCSS("position", "sticky");
        await test.expect(cell).toHaveCSS("inset-inline-start", "0px");
      }
      for (const cell of hours) {
        await test.expect(cell).toHaveCSS("text-align", "end");
        await test.expect(cell).toHaveCSS("white-space", "nowrap");
      }
      await test
        .expect(table.rowheader("Total"))
        .toHaveCSS("text-align", "end");
      await test
        .expect(table.columnheader("Contributor"))
        .toHaveCSS("text-align", "start");

      await query(q.article("Table rows"))
        .checkbox("Pin contributor names")
        .uncheck();

      for (const cell of names) {
        await test.expect(cell).toHaveCSS("position", "static");
      }
      for (const cell of hours) {
        await test.expect(cell).toHaveCSS("text-align", "end");
      }
    });
  },
);
