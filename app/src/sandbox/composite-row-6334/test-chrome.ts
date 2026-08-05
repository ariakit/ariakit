import { withFramework } from "#app/test-utils/preview.ts";

// https://github.com/ariakit/ariakit/issues/6334
withFramework(import.meta.dirname, async ({ test }) => {
  test("cells compute their position from row-level aria-posinset", async ({
    q,
  }) => {
    await test.expect(q.grid("Inbox")).toBeVisible();

    for (const position of [21, 22, 23, 24]) {
      const cell = q.gridcell(`Cell ${position}`);
      await test.expect(cell).toHaveAttribute("aria-posinset", `${position}`);
      await test.expect(cell).toHaveAttribute("aria-setsize", "100");
    }
  });
});
