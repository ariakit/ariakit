import { withFramework } from "#app/test-utils/preview.ts";

const options = ["Lemon", "Lime", "Orange", "Apple", "Banana"] as const;

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/6301
  test("sets sequential option positions across groups and leaves", async ({
    q,
  }) => {
    await q.combobox("Fruit").click();

    for (const [index, name] of options.entries()) {
      const option = q.option(name);
      await test.expect(option).toHaveAttribute("aria-setsize", "5");
      await test
        .expect(option)
        .toHaveAttribute("aria-posinset", `${index + 1}`);
    }
  });
});
