import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("panel updates tabindex when tabbable children change", async ({
    q,
  }) => {
    const panel = q.tabpanel("Panel");
    // Initially, panel has no tabbable children and should be focusable
    await test.expect(panel).toHaveAttribute("tabindex", "0");

    // Add tabbable content
    await q.button("Toggle").click();

    // Panel should no longer be focusable (has tabbable children now)
    await test.expect(panel).not.toHaveAttribute("tabindex");

    // Remove tabbable content
    await q.button("Toggle").click();

    // Panel should be focusable again
    await test.expect(panel).toHaveAttribute("tabindex", "0");
  });
});
