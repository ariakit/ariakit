import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972224343
  test("keeps the hovered suggestion active with optional hover props", async ({
    q,
  }) => {
    const input = q.combobox("Assignee");
    await input.click();
    const option = q.option("Bob");
    await option.scrollIntoViewIfNeeded();
    await option.hover();
    await input.hover();
    await input.press("Enter");
    await test.expect(input).toHaveValue("Bob");
    await test.expect(q.listbox()).not.toBeVisible();
  });
});
