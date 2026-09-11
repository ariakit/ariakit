import { withFramework } from "#app/test-utils/preview.ts";

withFramework(
  import.meta.dirname,
  { route: "table" },
  async ({ test, query }) => {
    // The lines are cut out of one border image, whose slice is physical, so
    // the table restates it for right to left. A slice that stayed in the
    // left-to-right order would leave the pinned cell's line unpainted.
    test("draws a pinned end cell's line on its start side in right to left", async ({
      q,
    }) => {
      const table = query(q.article("Right to left"));
      const pinned = table.columnheader("إجراءات");
      const before = table.columnheader("الحالة");
      await test.expect(pinned).toHaveCSS("position", "sticky");
      await test.expect(pinned).toHaveCSS("border-right-width", "1px");
      await test.expect(pinned).toHaveCSS("border-left-width", "0px");
      await test.expect(pinned).toHaveCSS("border-image-slice", "0 1 1 0");
      // The cell before the pin leaves its own line out.
      await test.expect(before).toHaveCSS("border-left-width", "0px");
      await test.expect(before).toHaveCSS("border-right-width", "0px");
    });
  },
);
