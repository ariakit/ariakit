import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("does not leak defaultChecked to the rendered menu item", async ({
    q,
  }) => {
    const item = q.menuitemradio("Compact");
    await test.expect(item).toHaveAttribute("aria-checked", "true");
    await test.expect(item).not.toHaveAttribute("data-default-checked-prop");
  });
});
