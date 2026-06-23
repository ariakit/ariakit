import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // See https://github.com/ariakit/ariakit/issues/6327
  test("uses aria-label instead of GroupLabel for the group name", async ({
    q,
  }) => {
    const group = q.group("Audio playback settings");
    await test.expect(group).toBeVisible();
    await test
      .expect(group)
      .toHaveAttribute("aria-label", "Audio playback settings");
    await test.expect(group).not.toHaveAttribute("aria-labelledby");
  });

  test("preserves explicit aria-labelledby when aria-label is passed", async ({
    q,
  }) => {
    const group = q.group("Explicit playback settings");
    await test.expect(group).toBeVisible();
    await test
      .expect(group)
      .toHaveAttribute("aria-label", "Audio playback settings");
    await test
      .expect(group)
      .toHaveAttribute("aria-labelledby", "explicit-group-label");
  });
});
