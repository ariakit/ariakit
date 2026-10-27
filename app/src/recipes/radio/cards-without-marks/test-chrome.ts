import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("names each rating with its word and starts without one", async ({
    q,
  }) => {
    const group = query(q.radiogroup("How was the support you got?"));
    for (const name of ["Terrible", "Bad", "Okay", "Good", "Great"]) {
      await test.expect(group.radio(name)).not.toBeChecked();
    }
    await group.text("Good").click();
    await test.expect(group.radio("Good")).toBeChecked();
  });
});
