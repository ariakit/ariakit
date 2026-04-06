import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("SelectItem store item children reflects rendered text, not value", async ({
    q,
  }) => {
    // The store items' children property should reflect the rendered text
    // content ("Apple", "Banana", "Cherry"), not the value prop ("apple",
    // "banana", "cherry").
    // See https://github.com/ariakit/ariakit/issues/5691
    const list = q.list("Store items");
    const items = list.getByRole("listitem");
    await test.expect(items).toHaveText(["Apple", "Banana", "Cherry"]);
  });
});
