import { withFramework } from "#app/test-utils/preview.ts";

withFramework(
  import.meta.dirname,
  { route: "table" },
  async ({ test, query }) => {
    test("selects rows with their checkboxes and the select-all", async ({
      q,
    }) => {
      const grid = query(q.grid("Select components"));
      const selectAll = grid.checkbox("Select all rows");
      // A row's name starts with its checkbox label, then its row header.
      const rowOf = (name: string) => grid.row(new RegExp(`^Select ${name} `));

      await test.expect(selectAll).toHaveAttribute("aria-checked", "mixed");
      await test
        .expect(rowOf("Glider"))
        .toHaveAttribute("aria-selected", "true");
      await test.expect(rowOf("Tabs")).toHaveAttribute("aria-selected", "true");
      await test
        .expect(rowOf("Button"))
        .toHaveAttribute("aria-selected", "false");

      await grid.checkbox("Select Button").click();
      await grid.checkbox("Select Table").click();
      await test
        .expect(rowOf("Button"))
        .toHaveAttribute("aria-selected", "true");
      await test.expect(selectAll).toBeChecked();

      await selectAll.click();
      for (const name of ["Button", "Glider", "Tabs", "Table"]) {
        await test
          .expect(rowOf(name))
          .toHaveAttribute("aria-selected", "false");
      }
      await test.expect(selectAll).not.toBeChecked();
    });
  },
);
