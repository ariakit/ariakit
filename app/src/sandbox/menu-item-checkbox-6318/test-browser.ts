import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
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
});
