import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("renders no buttons in a row without buttons", async ({ q }) => {
    const rows = [
      ["Row without buttons", "Filters without buttons"],
      ["Row with buttons set to none", "Filters with buttons set to none"],
      [
        "Row from a style recipe without buttons",
        "Filters from a style recipe without buttons",
      ],
    ] as const;
    for (const [title, label] of rows) {
      const box = query(q.article(title));
      await test.expect(box.toolbar(label)).toBeVisible();
      const backward = box.button("Scroll backward", { includeHidden: true });
      const forward = box.button("Scroll forward", { includeHidden: true });
      await test.expect(backward).toHaveCount(0);
      await test.expect(forward).toHaveCount(0);
    }
  });
});
