import { isPreviewHydrated } from "#app/lib/preview-hydration.ts";
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("selects rows with their checkboxes and the select-all", async ({
    q,
  }) => {
    const grid = query(q.grid("Select components"));
    const selectAll = grid.checkbox("Select all rows");
    // A row's name starts with its checkbox label, then its row header.
    const rowOf = (name: string) => grid.row(new RegExp(`^Select ${name} `));

    await test.expect(selectAll).toHaveAttribute("aria-checked", "mixed");
    await test.expect(rowOf("Glider")).toHaveAttribute("aria-selected", "true");
    await test.expect(rowOf("Tabs")).toHaveAttribute("aria-selected", "true");
    await test
      .expect(rowOf("Button"))
      .toHaveAttribute("aria-selected", "false");

    await grid.checkbox("Select Button").click();
    await grid.checkbox("Select Table").click();
    await test.expect(rowOf("Button")).toHaveAttribute("aria-selected", "true");
    await test.expect(selectAll).toBeChecked();

    await selectAll.click();
    for (const name of ["Button", "Glider", "Tabs", "Table"]) {
      await test.expect(rowOf(name)).toHaveAttribute("aria-selected", "false");
    }
    await test.expect(selectAll).not.toBeChecked();
  });

  test("moves cell focus with the arrow keys", async ({ page, q }) => {
    const grid = query(q.article("Selected rows"));
    await grid.checkbox("Select all rows").focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowRight");
    await test.expect(grid.rowheader("Glider")).toBeFocused();
    await test
      .expect(grid.row(/\bGlider\b/))
      .toHaveAttribute("aria-selected", "true");
  });

  test("moves row focus with the arrow keys", async ({ page, q }) => {
    const grid = query(q.article("Focusable rows"));
    const first = grid.row(/^Button /);
    await first.focus();
    await page.keyboard.press("ArrowDown");
    await test.expect(first).not.toBeFocused();
    await page.keyboard.press("ArrowUp");
    await test.expect(first).toBeFocused();
    await page.keyboard.press("End");
    await test.expect(grid.row(/^Table /)).toBeFocused();
  });

  // Regression fixtures.
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972228648
  test("selects the cell layer row from its checkbox", async ({ q }) => {
    const fixture = query(q.article("Table cell layer"));
    await test
      .expect(fixture.row())
      .not.toHaveAttribute("aria-selected", "true");
    await fixture.checkbox("Select row").check();
    await test.expect(fixture.row()).toHaveAttribute("aria-selected", "true");
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974212082
  test("keeps edited notes with each contributor after reordering and insertion", async ({
    q,
  }) => {
    const fixture = query(q.article("Table rows"));
    await fixture.textbox("Ada notes").fill("Ready for review");
    await fixture.textbox("Grace notes").fill("Tests complete");
    await fixture.button("Reverse rows").click();

    await test
      .expect(fixture.cell(/^(Ada|Grace)$/))
      .toHaveText(["Grace", "Ada"]);
    await test
      .expect(fixture.textbox("Ada notes"))
      .toHaveValue("Ready for review");
    await test
      .expect(fixture.textbox("Grace notes"))
      .toHaveValue("Tests complete");

    await fixture.button("Add contributor").click();

    await test
      .expect(fixture.cell(/^(Ada|Grace|Katherine)$/))
      .toHaveText(["Katherine", "Grace", "Ada"]);
    await test.expect(fixture.textbox("Katherine notes")).toHaveValue("");
    await test
      .expect(fixture.textbox("Ada notes"))
      .toHaveValue("Ready for review");
    await test
      .expect(fixture.textbox("Grace notes"))
      .toHaveValue("Tests complete");
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974212082
  test("renders column cells without the reserved row metadata", async ({
    q,
  }) => {
    const table = query(q.table("Team hours"));
    await test
      .expect(table.columnheader())
      .toHaveText(["Contributor", "Hours", "Notes"]);
    await test.expect(query(table.row(/^Ada /)).cell()).toHaveCount(3);
    await test.expect(query(table.row(/^Grace /)).cell()).toHaveCount(3);
    await test.expect(table.rowheader("Total")).toHaveAttribute("scope", "row");
    await test.expect(query(table.row(/^Total /)).cell()).toHaveCount(2);
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974552570
  test("keeps missing hours under their header when adding a contributor", async ({
    q,
  }) => {
    const fixture = query(q.article("Table rows"));
    await fixture.button("Add contributor").click();

    const cells = query(fixture.row(/^Katherine\b/)).cell();
    await test.expect(cells).toHaveCount(3);
    await test.expect(cells.nth(0)).toHaveText("Katherine");
    await test.expect(cells.nth(1)).toBeEmpty();
    await test
      .expect(query(cells.nth(2)).textbox("Katherine notes"))
      .toHaveValue("");
  });

  // Explicit zero must not share an identity with an unkeyed row at index zero.
  test("keeps keyed row edits when unkeyed rows change position", async ({
    q,
  }) => {
    const fixture = query(q.article("Mixed row keys"));
    await fixture.textbox("Assigned task notes").fill("Ready to assign");
    await fixture.button("Reverse task rows").click();

    await test
      .expect(fixture.cell(/^(Draft|Assigned) task$/))
      .toHaveText(["Assigned task", "Draft task"]);
    await test
      .expect(fixture.textbox("Assigned task notes"))
      .toHaveValue("Ready to assign");
    await test.expect(fixture.textbox("Draft task notes")).toHaveValue("Draft");
  });

  // A declarative value that is an element other than a TableCell is the cell's
  // content. It used to be cloned as the cell itself, which put it in the row
  // beside the cells, with the column props on it.
  test("renders element values inside the cells of their columns", async ({
    page,
    q,
  }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() !== "error") return;
      errors.push(message.text());
    });
    // withFramework loaded the sandbox before the listener existed, and React
    // reports invalid nesting and props while the island renders.
    await page.reload({ waitUntil: "load" });
    await page.waitForFunction(isPreviewHydrated);

    const table = query(q.table("Element values"));
    const row = table.row(/^Ada /);
    await test.expect(query(row).rowheader("Ada")).toBeVisible();
    const cells = query(row).cell();
    await test.expect(cells).toHaveCount(2);
    await test.expect(cells.nth(0)).toHaveText("Active");
    await test.expect(query(cells.nth(1)).button("Edit Ada")).toBeVisible();
    test.expect(errors).toEqual([]);
  });
});
