import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  // Reproduces https://github.com/ariakit/ariakit/issues/7305
  test("uses the nested grid role for groups and rows", async ({ q }) => {
    await q.combobox("Grouped direction").click();
    const grid = q.grid("Grouped directions");
    const gridQuery = query(grid);
    await test.expect(gridQuery.rowgroup()).toBeVisible();
    await test.expect(gridQuery.row()).toBeVisible();
    await test.expect(gridQuery.gridcell()).toHaveCount(2);
  });

  test("preserves grid roles with explicit-store hooks", async ({ q }) => {
    await q.combobox("Hook direction").click();
    const grid = q.grid("Hook directions");
    const gridQuery = query(grid);
    await test.expect(gridQuery.rowgroup()).toBeVisible();
    await test.expect(gridQuery.row()).toBeVisible();
    await test.expect(gridQuery.gridcell()).toHaveCount(2);
  });

  test("preserves grid roles for hooks under select scope", async ({
    page,
  }) => {
    const roles = page.getByTestId("select-hook-roles");
    await test.expect(roles).toHaveAttribute("data-group-role", "rowgroup");
    await test.expect(roles).toHaveAttribute("data-row-role", "row");
  });

  test("does not fall back while a nested list role is pending", async ({
    page,
  }) => {
    const roles = page.getByTestId("pending-list-hook-roles");
    await test.expect(roles).toHaveAttribute("data-group-role", "group");
    await test.expect(roles).toHaveAttribute("data-row-role", "presentation");
  });
});
