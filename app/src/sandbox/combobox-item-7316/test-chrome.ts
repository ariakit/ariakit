import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  // Reproduces https://github.com/ariakit/ariakit/issues/7316
  test("uses the explicit store role under another popup", async ({ q }) => {
    const listbox = q.listbox("Inner list");
    await test.expect(query(listbox).option("Inner item")).toBeVisible();
  });

  // Reproduces https://github.com/ariakit/ariakit/issues/7316
  test("uses the explicit store role without a provider", async ({ q }) => {
    const menu = q.menu("Standalone menu");
    await test.expect(query(menu).menuitem("Standalone item")).toBeVisible();
  });
});
