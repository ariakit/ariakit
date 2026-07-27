import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("renders an accessible command in the tab order", async ({
    page,
    q,
  }) => {
    const command = q.text("Default command");
    await test.expect(command).toHaveAttribute("role", "button");
    await test.expect(command).toHaveAttribute("tabindex", "0");
    await page.keyboard.press("Tab");
    await test.expect(command).toBeFocused();
  });

  test("activates the default command with Enter and Space", async ({
    page,
    q,
  }) => {
    await q.text("Default command").focus();
    await page.keyboard.press("Enter");
    await test.expect(q.status("Default activations")).toHaveText("1");
    await page.keyboard.press("Space");
    await test.expect(q.status("Default activations")).toHaveText("2");
  });

  test("disables only Enter activation", async ({ page, q }) => {
    await q.text("Enter disabled").focus();
    await page.keyboard.press("Enter");
    await test.expect(q.status("Enter disabled activations")).toHaveText("0");
    await page.keyboard.press("Space");
    await test.expect(q.status("Enter disabled activations")).toHaveText("1");
  });

  test("disables only Space activation", async ({ page, q }) => {
    await q.text("Space disabled").focus();
    await page.keyboard.press("Enter");
    await test.expect(q.status("Space disabled activations")).toHaveText("1");
    await page.keyboard.press("Space");
    await test.expect(q.status("Space disabled activations")).toHaveText("1");
  });
});
