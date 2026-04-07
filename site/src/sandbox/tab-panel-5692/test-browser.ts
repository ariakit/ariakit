import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("panel without tabbable children is focusable", async ({ q }) => {
    // The "Static" tab is selected by default, its panel has no tabbable
    // children and should be focusable.
    await test.expect(q.tabpanel("Static")).toHaveAttribute("tabindex", "0");
  });

  test("panel with tabbable children is not focusable after selection", async ({
    q,
  }) => {
    // Select the "Interactive" tab whose panel has a tabbable link.
    await q.tab("Interactive").click();
    await test
      .expect(q.tabpanel("Interactive"))
      .not.toHaveAttribute("tabindex");
  });
});
