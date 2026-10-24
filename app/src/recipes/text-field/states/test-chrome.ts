import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("names and describes the field in each state", async ({ q }) => {
    await test.expect(q.textbox("Username")).toHaveAccessibleDescription("");
    await test
      .expect(q.textbox("Display name"))
      .toHaveAccessibleDescription("Shown on your profile.");
    await test
      .expect(q.textbox("Email"))
      .toHaveAccessibleDescription("Enter an email address. Used to sign in.");
    await test
      .expect(q.textbox("Email"))
      .toHaveAttribute("aria-invalid", "true");
    await test.expect(q.textbox("Workspace")).toBeDisabled();
    await test
      .expect(q.textbox("Workspace"))
      .toHaveAccessibleDescription("Only owners can rename it.");
  });
});
