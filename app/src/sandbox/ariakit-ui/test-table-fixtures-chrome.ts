import {
  waitForPreviewHydration,
  withFramework,
} from "#app/test-utils/preview.ts";

withFramework(
  import.meta.dirname,
  { route: "table-fixtures" },
  async ({ test, query }) => {
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
      await test
        .expect(table.rowheader("Total"))
        .toHaveAttribute("scope", "row");
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

    // Explicit zero must not share an identity with an unkeyed row at index
    // zero.
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
      await test
        .expect(fixture.textbox("Draft task notes"))
        .toHaveValue("Draft");
    });

    // A declarative value that is an element other than a TableCell is the
    // cell's content. It used to be cloned as the cell itself, which put it in
    // the row beside the cells, with the column props on it.
    test("renders element values inside the cells of their columns", async ({
      page,
      q,
    }) => {
      const errors: string[] = [];
      page.on("console", (message) => {
        if (message.type() !== "error") return;
        errors.push(message.text());
      });
      // withFramework loaded the page before the listener existed, and React
      // reports invalid nesting and props while the island renders.
      await page.reload({ waitUntil: "load" });
      await waitForPreviewHydration(page);

      const table = query(q.table("Element values"));
      const row = table.row(/^Ada /);
      await test.expect(query(row).rowheader("Ada")).toBeVisible();
      const cells = query(row).cell();
      await test.expect(cells).toHaveCount(2);
      await test.expect(cells.nth(0)).toHaveText("Active");
      await test.expect(query(cells.nth(1)).button("Edit Ada")).toBeVisible();
      // The column's $fit reaches the cell around the button, not the button.
      await test.expect(cells.nth(1)).toHaveCSS("white-space", "nowrap");
      test.expect(errors).toEqual([]);
    });
  },
);
