import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("focuses fields and validates them on blur", async ({ page, q }) => {
    const name = q.textbox("Name");
    const email = q.textbox("Email");
    const errors = q.alert().filter({ hasText: /./ });

    await test.expect(name).not.toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(name).toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(errors).toHaveCount(1);
    await page.keyboard.press("Tab");
    await test.expect(errors).toHaveCount(2);

    await name.fill("John");
    await test.expect(errors).toHaveCount(1);
    await email.fill("john@example.com");
    await q.button("Reset").click();
    await test.expect(name).toHaveValue("");
    await test.expect(email).toHaveValue("");
  });

  test("focuses the first invalid field on submit", async ({ q }) => {
    await q.button("Add").click();
    await test.expect(q.alert().filter({ hasText: /./ })).toHaveCount(2);
    await test.expect(q.textbox("Name")).toBeFocused();
  });

  test("submits and resets valid values", async ({ page, q }) => {
    await q.textbox("Name").fill("John");
    await q.textbox("Email").fill("john@example.com");

    await Promise.all([
      page.waitForEvent("dialog").then(async (dialog) => {
        test
          .expect(dialog.message())
          .toBe(JSON.stringify({ name: "John", email: "john@example.com" }));
        await dialog.accept();
      }),
      q.button("Add").click(),
    ]);

    await test.expect(q.textbox("Name")).toHaveValue("");
    await test.expect(q.textbox("Email")).toHaveValue("");
  });
});
