import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/pull/6832
  test("does not take focus when the popup starts open", async ({
    page,
    q,
  }) => {
    await test.expect(q.option("Onion")).toHaveAttribute("data-active-item");

    await test.expect(page.locator("body")).toBeFocused();
    await test.expect(q.combobox("Vegetable")).not.toBeFocused();
    await test.expect(q.option("Onion")).not.toBeFocused();
  });
});
