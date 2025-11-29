import { withNextjs } from "#app/test-utils/preview.ts";

withNextjs(import.meta.dirname, async ({ test }) => {
  test("default tab selected @visual", async ({ q, visual }) => {
    await test
      .expect(q.tab("Documentation"))
      .toHaveAttribute("aria-selected", "true");
    await test.expect(q.tabpanel()).toContainText("Documentation");
    await visual();
  });

  test("click second tab @visual", async ({ q, visual }) => {
    await q.tab("Learning").click();
    await test
      .expect(q.tab("Learning"))
      .toHaveAttribute("aria-selected", "true");
    await test.expect(q.tabpanel()).toContainText("Learning");
    await visual();
  });
});
