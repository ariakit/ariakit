import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("select tab panels", async ({ q }) => {
    await test.expect(q.tab("Tab 1")).toHaveAttribute("aria-selected", "true");
    await test.expect(q.tabpanel("Tab 1")).toBeVisible();
    await test.expect(q.tabpanel("Tab 2")).not.toBeVisible();
    await q.tab("Tab 2").click();
    await test.expect(q.tab("Tab 2")).toHaveAttribute("aria-selected", "true");
    await test.expect(q.tabpanel("Tab 2")).toBeVisible();
    await test.expect(q.tabpanel("Tab 1")).not.toBeVisible();
  });
});
