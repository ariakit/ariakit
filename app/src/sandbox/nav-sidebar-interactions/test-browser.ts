import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972223730
  test("preserves custom navigation label styles when the sidebar collapses", async ({
    q,
  }) => {
    const label = q.text("Account menu");
    await test.expect(label).toHaveCSS("color", "rgb(128, 0, 128)");
    await test.expect(label).toHaveCSS("font-weight", "600");
    await test.expect(label).toHaveCSS("overflow", "hidden");
    await test.expect(label).toHaveCSS("opacity", "1");

    await q.button("Collapse navigation").click();
    await test.expect(label).toHaveCSS("opacity", "0");

    await q.button("Expand navigation").click();
    await test.expect(label).toHaveCSS("opacity", "1");
    await test.expect(label).toHaveCSS("color", "rgb(128, 0, 128)");
    await test.expect(label).toHaveCSS("font-weight", "600");
  });
});
