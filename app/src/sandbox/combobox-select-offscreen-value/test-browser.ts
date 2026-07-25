import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("keeps value-less offscreen items offscreen with no selected value", async ({
    q,
  }) => {
    await q.combobox("Fruit").click();

    await test.expect(q.option("No fruit")).toHaveAttribute("data-offscreen");
  });

  test("mounts the offscreen item matching the selected value", async ({
    q,
  }) => {
    await q.combobox("Selected fruit").click();

    await test.expect(q.option("Apple")).not.toHaveAttribute("data-offscreen");
    await test
      .expect(q.option("No selected fruit"))
      .toHaveAttribute("data-offscreen");
  });
});
