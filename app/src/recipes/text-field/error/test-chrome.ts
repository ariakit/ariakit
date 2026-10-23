import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("reads the error before the hint and marks the field invalid", async ({
    q,
  }) => {
    const field = q.textbox("Email");
    await test.expect(field).toHaveAttribute("aria-invalid", "true");
    await test
      .expect(field)
      .toHaveAccessibleDescription(
        "Enter an email address like ada@example.com. We send a confirmation link to this address.",
      );
  });
});
