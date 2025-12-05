import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("default tab selected @visual", async ({ q, visual }) => {
    // await test
    //   .expect(q.tab("Documentation"))
    //   .toHaveAttribute("aria-selected", "true");
    // await test.expect(q.tabpanel()).toContainText("Documentation");
    await visual();
  });
});
