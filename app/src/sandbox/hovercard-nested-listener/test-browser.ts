import { withFramework } from "#app/test-utils/preview.ts";

// See https://github.com/ariakit/ariakit/pull/6143
withFramework(import.meta.dirname, async ({ test }) => {
  test("toggling a nested hovercard does not reinstall the parent mousemove listener", async ({
    q,
  }) => {
    const installs = q.status("Parent hovercard mousemove listener installs");
    await test.expect(q.dialog("Parent hovercard")).toBeVisible();
    const initialInstalls = (await installs.textContent()) ?? "";

    // Mounting a nested hovercard must not reinstall the parent's listener.
    await q.button("Toggle nested").click();
    await test.expect(q.dialog("Nested hovercard")).toBeVisible();
    await test.expect(installs).toHaveText(initialInstalls);

    // Unmounting the nested hovercard must not reinstall it either.
    await q.button("Toggle nested").click();
    await test.expect(q.dialog("Nested hovercard")).not.toBeAttached();
    await test.expect(installs).toHaveText(initialInstalls);
  });
});
