import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("keeps the values of each form when the tab changes", async ({ q }) => {
    await query(q.tabpanel("Sign in")).textbox("Email").fill("sam@example.com");
    await q.tab("Sign up").click();
    const signUp = query(q.tabpanel("Sign up"));
    await signUp.textbox("Name").fill("Sam");
    await test.expect(signUp.textbox("Email")).toHaveValue("");

    await q.tab("Sign in").click();
    await test
      .expect(query(q.tabpanel("Sign in")).textbox("Email"))
      .toHaveValue("sam@example.com");
    await q.tab("Sign up").click();
    await test.expect(signUp.textbox("Name")).toHaveValue("Sam");
  });

  test("gives both tabs the same width", async ({ q }) => {
    const signInBox = await q.tab("Sign in").boundingBox();
    const signUpBox = await q.tab("Sign up").boundingBox();
    test.expect(signInBox?.width).toBeCloseTo(signUpBox?.width ?? 0, 0);
  });
});
