import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("restores data-enter after a no-transition close", async ({ q }) => {
    const section = q.region("No transition");
    const withinSection = query(section);
    const content = withinSection.text("No transition content");

    await test.expect(content).toBeHidden();
    await test.expect(section).toHaveAttribute("data-animated-state", "true");

    await withinSection.button("Toggle No transition").click();
    await test.expect(content).toBeVisible();
    await test.expect(content).toHaveAttribute("data-enter", "true");
    await test.expect(section).toHaveAttribute("data-animated-state", "false");
    await test.expect(section).toHaveAttribute("data-animating-state", "false");

    await withinSection.button("Toggle No transition").click();
    await test.expect(content).toBeHidden();
    await test.expect(content).not.toHaveAttribute("data-enter");
    await test.expect(section).toHaveAttribute("data-mounted-state", "false");

    await withinSection.button("Toggle No transition").click();
    await test.expect(content).toBeVisible();
    await test.expect(content).toHaveAttribute("data-enter", "true");
  });

  test("unmounts immediately after no-transition enter detection", async ({
    q,
  }) => {
    const section = q.region("Unmount on hide");
    const withinSection = query(section);
    const content = withinSection.text("Unmounted no transition content");

    await test.expect(content).not.toBeAttached();

    await withinSection.button("Toggle Unmount on hide").click();
    await test.expect(content).toBeVisible();
    await test.expect(content).toHaveAttribute("data-enter", "true");
    await test.expect(section).toHaveAttribute("data-animated-state", "false");
    await test.expect(section).toHaveAttribute("data-animating-state", "false");

    await withinSection.button("Toggle Unmount on hide").click();
    await test.expect(content).not.toBeAttached();
    await test.expect(section).toHaveAttribute("data-mounted-state", "false");
    await test.expect(section).toHaveAttribute("data-animating-state", "false");

    await withinSection.button("Toggle Unmount on hide").click();
    await test.expect(content).toBeVisible();
    await test.expect(content).toHaveAttribute("data-enter", "true");
    await test.expect(section).toHaveAttribute("data-animated-state", "false");
  });

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
