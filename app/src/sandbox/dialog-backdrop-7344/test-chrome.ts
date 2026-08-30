// See https://github.com/ariakit/ariakit/issues/7344
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("backdrop carries the hidden attribute along with the dialog", async ({
    q,
  }) => {
    // Role queries skip hidden elements by default, but this test is about the
    // attribute a hidden element must carry.
    const dialog = q.dialog(undefined, { includeHidden: true });
    const backdrop = q.presentation(undefined, { includeHidden: true });

    await test.expect(dialog).toHaveAttribute("hidden");
    await test.expect(backdrop).toHaveAttribute("hidden");

    await q.button("Show dialog").click();
    await test.expect(dialog).not.toHaveAttribute("hidden");
    await test.expect(backdrop).not.toHaveAttribute("hidden");
    await test.expect(backdrop).toBeVisible();

    await q.button("Close").click();
    await test.expect(dialog).toHaveAttribute("hidden");
    await test.expect(backdrop).toHaveAttribute("hidden");
  });
});
