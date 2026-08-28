import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  // Modal dialogs keep the fallback dismiss button so that screen reader users
  // aren't trapped in them. Menu opts out of it because the ARIA menu pattern
  // doesn't allow a `button` there, and that opt out must stay scoped to menus.
  // https://github.com/ariakit/ariakit/issues/4270
  test("modal dialog without a dismiss element gets a hidden one", async ({
    q,
  }) => {
    await q.button("Terms").click();
    const dialog = q.dialog("Terms");
    await test.expect(dialog).toBeVisible();
    await test.expect(query(dialog).button("Dismiss popup")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/4270
  test("modal dialog with a dismiss element gets no hidden one", async ({
    q,
  }) => {
    await q.button("Receipt").click();
    const dialog = q.dialog("Receipt");
    await test.expect(dialog).toBeVisible();
    await test.expect(query(dialog).button()).toHaveCount(1);
    await test.expect(query(dialog).button("Done")).toBeVisible();
  });
});
