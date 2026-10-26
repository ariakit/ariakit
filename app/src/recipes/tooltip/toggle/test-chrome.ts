import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("names the action in the tooltip and keeps the button name", async ({
    q,
  }) => {
    const mute = q.button("Mute");
    await test.expect(mute).toHaveAttribute("aria-pressed", "false");
    // Ariakit resets hover intent on scroll, so the anchor must be in view
    // before the pointer moves over it.
    await mute.scrollIntoViewIfNeeded();
    await mute.hover();
    await test.expect(q.tooltip("Mute")).toBeVisible();
    await mute.click();
    await test.expect(mute).toHaveAttribute("aria-pressed", "true");
    await test.expect(q.tooltip("Unmute")).toBeVisible();
    await mute.click();
    await test.expect(mute).toHaveAttribute("aria-pressed", "false");
    await test.expect(q.tooltip("Mute")).toBeVisible();
  });
});
