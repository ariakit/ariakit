import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("moves focus to the next step after marking a step as done", async ({
    q,
  }) => {
    await q.button("Mark as done").click();
    const team = q.button(/Invite your team/);
    await test.expect(team).toBeFocused();
    await test.expect(team).toHaveAttribute("aria-expanded", "true");

    await q.button("Mark as done").click();
    const project = q.button(/Create your first project/);
    await test.expect(project).toBeFocused();
    await test.expect(project).toHaveAttribute("aria-expanded", "true");

    // With no step left, focus stays on the button of the finished step.
    await q.button("Mark as done").click();
    await test.expect(project).toBeFocused();
    await test.expect(project).toHaveAttribute("aria-expanded", "false");
  });
});
