import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("reads the badge after the plan name and the price as a description", async ({
    q,
  }) => {
    const group = query(q.radiogroup("Plan"));
    const pro = group.radio("Pro Popular");
    await test.expect(pro).toBeChecked();
    await test
      .expect(pro)
      .toHaveAccessibleDescription("$12 per month. For growing teams.");
    await group.text("Team").click();
    await test.expect(group.radio("Team")).toBeChecked();
  });
});
