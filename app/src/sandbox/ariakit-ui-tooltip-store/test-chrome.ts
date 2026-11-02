import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("shows a store's open tooltip when its text arrives", async ({ q }) => {
    await test.expect(q.tooltip()).toHaveCount(0);
    await q.button("Save").click();
    await test.expect(q.tooltip("Saved a minute ago")).toBeVisible();
  });

  for (const name of ["No text", "With text"]) {
    test(`opens the dialog of a disclosure anchor: ${name}`, async ({ q }) => {
      await q.button(name).click();
      await test.expect(q.dialog(`${name} dialog`)).toBeVisible();
    });
  }
});
