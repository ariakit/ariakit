import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("default tab selected", async ({ q }) => {
    await test.expect(q.tab("Hot")).toHaveAttribute("aria-selected", "true");
    await test.expect(q.tab("New")).toHaveAttribute("aria-selected", "false");
  });
});
