import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("disables the group after the vote and keeps focus on the button", async ({
    q,
  }) => {
    const group = query(q.radiogroup("What should we build next?"));
    const vote = q.button("Vote");
    await test.expect(vote).toBeDisabled();
    await group.radio("Mobile app").click();
    await test.expect(vote).toBeEnabled();
    await vote.click();
    await test
      .expect(q.status())
      .toHaveText("Thanks. You voted for Mobile app.");
    await test.expect(group.radio("Mobile app")).toBeChecked();
    await test.expect(group.radio("Mobile app")).toBeDisabled();
    await test.expect(group.radio("Dark mode for reports")).toBeDisabled();
    await test.expect(vote).toBeDisabled();
    await test.expect(vote).toBeFocused();
  });
});
