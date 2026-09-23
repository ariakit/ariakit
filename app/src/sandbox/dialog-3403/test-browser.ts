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
    await test.expect(dialog).not.toBeAttached();
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
    await test.expect(dialog).not.toBeAttached();
  });

  test("route dialog without unmountOnHide preserves close behavior", async ({
    q,
    page,
  }) => {
    await q.button("Show route dialog without unmountOnHide").click();

    const dialog = q.dialog("Route dialog without unmountOnHide", {
      includeHidden: true,
    });
    await test.expect(dialog).toBeVisible();
    // The enter state is where Ariakit finds that this dialog has no
    // transition, so Escape then hides it in the keydown task instead of after
    // leave frames that a stalled CI runner can delay.
    // https://github.com/ariakit/ariakit/issues/7606
    await test.expect(dialog).toHaveAttribute("data-enter", "true");

    await page.keyboard.press("Escape");
    await test.expect(dialog).toBeHidden();
    await test.expect(dialog).toBeAttached();
  });
});
