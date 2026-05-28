import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("dialog with explicit store waits for leave transition before unmount", async ({
    q,
  }) => {
    // See https://github.com/ariakit/ariakit/issues/3403
    await q.button("Show dialog with store").click();

    const dialog = q.dialog("Dialog with store", { includeHidden: true });
    await test.expect(dialog).toBeVisible();

    await q.button("Close").click();
    await test.expect(dialog).toBeAttached();
    await test.expect(dialog).toHaveAttribute("data-leave", "true");
  });

  test("controlled dialog without explicit store waits for leave transition before unmount", async ({
    q,
  }) => {
    // See https://github.com/ariakit/ariakit/issues/3403
    await q.button("Show dialog without store").click();

    const dialog = q.dialog("Dialog without store", { includeHidden: true });
    await test.expect(dialog).toBeVisible();

    await q.button("Close").click();
    await test.expect(dialog).toBeAttached();
    await test.expect(dialog).toHaveAttribute("data-leave", "true");
  });
});
