import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("SelectItem with id={undefined} does not cause infinite loop on click", async ({
    page,
    q,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await q.combobox("Favorite fruit").click();
    await test.expect(q.option("Apple")).toBeVisible();
    // Clicking an item when id={undefined} is passed should not throw
    // "Maximum call stack size exceeded" due to an infinite event loop between
    // blur events and focus handling.
    // See https://github.com/ariakit/ariakit/issues/4593
    await q.option("Banana").click();
    await test.expect(q.combobox("Favorite fruit")).toHaveText("Banana");
    test.expect(errors).toEqual([]);
  });
});
