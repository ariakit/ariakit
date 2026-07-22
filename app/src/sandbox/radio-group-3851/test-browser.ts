import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/3851
  test("disabled prop disables the radios", async ({ q }) => {
    await test.expect(q.radio("Apple")).toBeDisabled();
    await test.expect(q.radio("Orange")).toBeDisabled();
    await test.expect(q.radio("Watermelon")).toBeDisabled();
  });
});
