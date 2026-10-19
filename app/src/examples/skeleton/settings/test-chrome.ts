import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("enables the form after the account loads", async ({ q }) => {
    await test.expect(q.status()).toHaveText("Loading account");
    await test.expect(q.textbox("Name")).toHaveCount(0);
    await test.expect(q.button("Save changes")).toBeDisabled();
    await test.expect(q.status()).toHaveText("Account loaded");
    await test.expect(q.textbox("Name")).toHaveValue("Ana Souza");
    await test
      .expect(q.checkbox("Email me about product updates"))
      .toBeChecked();
    await test.expect(q.button("Save changes")).toBeEnabled();
  });
});
