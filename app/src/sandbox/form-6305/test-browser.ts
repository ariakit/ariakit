import { withFramework } from "#app/test-utils/preview.ts";

// Reproduces https://github.com/ariakit/ariakit/issues/6305
withFramework(import.meta.dirname, async ({ test }) => {
  test("failed submit focuses the first invalid field in document order", async ({
    q,
  }) => {
    await q.button("Add company details").click();

    const company = q.textbox("Company");
    const email = q.textbox("Email");

    await q.button("Sign up").click();

    await test.expect(company).toHaveAttribute("aria-invalid", "true");
    await test.expect(email).toHaveAttribute("aria-invalid", "true");
    await test.expect(company).toBeFocused();
  });
});
