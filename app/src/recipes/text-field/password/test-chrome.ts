import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("shows and hides the password with the same button", async ({
    page,
    q,
  }) => {
    const toggle = q.button("Show password");
    const password = page.getByLabel("Password", { exact: true });
    await test.expect(password).toHaveAttribute("type", "password");
    await test.expect(toggle).toHaveAttribute("aria-pressed", "false");
    await toggle.click();
    await test.expect(toggle).toHaveAttribute("aria-pressed", "true");
    await test.expect(password).toHaveAttribute("type", "text");
    await test.expect(password).toHaveValue("correct horse battery");
    await test
      .expect(password)
      .toHaveAccessibleDescription("Use at least 12 characters.");
    await toggle.click();
    await test.expect(password).toHaveAttribute("type", "password");
  });
});
