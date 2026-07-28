import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // Reproduces https://github.com/ariakit/ariakit/issues/6318
  test("syncs boolean item checked state with menu values", async ({ q }) => {
    await q.button("View").click();

    await test
      .expect(q.menuitemcheckbox("Show sidebar"))
      .toHaveAttribute("aria-checked", "true");
    await test
      .expect(q.menuitemcheckbox("Minimap"))
      .toHaveAttribute("aria-checked", "true");
    await test
      .expect(q.status("Menu values"))
      .toHaveText('{"showSidebar":true,"minimap":true}');
  });

  test("does not leak defaultChecked to the rendered menu item", async ({
    q,
  }) => {
    await q.button("Preferences").click();

    const item = q.menuitemradio("Compact");
    await test.expect(item).toBeVisible();
    await test.expect(item).toHaveAttribute("aria-checked", "true");
    await test.expect(item).not.toHaveAttribute("data-default-checked-prop");
  });
});
