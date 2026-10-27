import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("names each option with its label and describes it with its description", async ({
    q,
  }) => {
    const group = query(q.radiogroup("Who can open this link?"));
    const radio = group.radio("Anyone at Acme");
    await test.expect(radio).toBeChecked();
    await test
      .expect(radio)
      .toHaveAccessibleDescription("People signed in with an Acme account");
    await test
      .expect(group.radio("Anyone with the link"))
      .toHaveAccessibleDescription("No sign-in needed");
  });
});
