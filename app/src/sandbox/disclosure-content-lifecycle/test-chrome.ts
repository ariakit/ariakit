import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("keeps unmountOnHide content mounted for numeric timeouts", async ({
    q,
  }) => {
    const section = q.region("Timed unmount");
    const withinSection = query(section);
    const content = withinSection.text("Timed unmount content");

    await test.expect(content).not.toBeAttached();
    await test.expect(section).toHaveAttribute("data-animated-state", "1000");

    await withinSection.button("Toggle Timed unmount").click();
    await test.expect(content).toBeVisible();
    await test.expect(content).toHaveAttribute("data-enter", "true");
    await test.expect(section).toHaveAttribute("data-animated-state", "1000");

    await withinSection.button("Toggle Timed unmount").click();
    await test.expect(content).toBeAttached();
    await test.expect(content).toHaveAttribute("data-leave", "true");
    await test.expect(section).toHaveAttribute("data-mounted-state", "true");
    await test.expect(content).not.toBeAttached();
    await test.expect(section).toHaveAttribute("data-mounted-state", "false");
  });
});
