import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/pull/7993#discussion_r4317548122
  test("submits the loaded values without changes", async ({ q }) => {
    const save = q.button("Save changes");
    await test.expect(save).toBeEnabled();
    await save.click();
    // Native validation would move focus to the first invalid field.
    await test.expect(save).toBeFocused();
  });
});
