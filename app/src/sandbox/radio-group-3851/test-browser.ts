import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/3851
  test("disabled prop disables the group and radios", async ({ q }) => {
    await test
      .expect(q.radiogroup("Fruits"))
      .toHaveAttribute("aria-disabled", "true");
    await test.expect(q.radio("Apple")).toBeDisabled();
    await test.expect(q.radio("Orange")).toBeDisabled();
    await test.expect(q.radio("Watermelon")).toBeDisabled();
    await test
      .expect(q.radio("Banana"))
      .toHaveAttribute("aria-disabled", "true");
  });
});
