import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("keeps null and reordered row cells aligned", async ({ q }) => {
    const rows = query(q.table()).row();
    await test.expect(rows).toHaveCount(3);

    const firstRowCells = query(rows.nth(1)).cell();
    const secondRowCells = query(rows.nth(2)).cell();

    await test.expect(firstRowCells).toHaveText(["Ada", "", "London"]);
    await test.expect(secondRowCells).toHaveText(["Grace", "38", "Paris"]);
  });
});
