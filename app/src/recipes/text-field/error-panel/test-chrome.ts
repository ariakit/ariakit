import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("reads the error panel before the hint and marks the field invalid", async ({
    q,
  }) => {
    const field = q.textbox("Email");
    await test.expect(field).toHaveAttribute("aria-invalid", "true");
    await test
      .expect(field)
      .toHaveAccessibleDescription(
        "Another account uses this address. Sign in or use a different address. We send a confirmation link to this address.",
      );
    await test.expect(q.link("Sign in")).toHaveAttribute("href", "#sign-in");
  });
});
