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

  // https://github.com/ariakit/ariakit/pull/7993#discussion_r4317548122
  test("submits the loaded values without changes", async ({ q }) => {
    const save = q.button("Save changes");
    await test.expect(save).toBeEnabled();
    await save.click();
    // Native validation would move focus to the first invalid field.
    await test.expect(save).toBeFocused();
  });
});
