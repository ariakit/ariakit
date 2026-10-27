import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("names each theme with its label, not its picture", async ({ q }) => {
    const group = query(q.radiogroup("Theme"));
    await test.expect(group.radio("System")).toBeChecked();
    await group.text("Dark").click();
    await test.expect(group.radio("Dark")).toBeChecked();
    await test.expect(group.radio("System")).not.toBeChecked();
  });
});
