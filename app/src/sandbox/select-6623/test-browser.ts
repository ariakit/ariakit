import { withFramework } from "#app/test-utils/preview.ts";

// https://github.com/ariakit/ariakit/issues/6623
withFramework(import.meta.dirname, async ({ test }) => {
  test("redirects focus to the listbox when an option is focused on mount", async ({
    q,
  }) => {
    await q.combobox("Favorite fruit").click();
    await test.expect(q.listbox()).toBeVisible();
    await test.expect(q.listbox()).toBeFocused();
    await test.expect(q.option("Banana")).toHaveAttribute("data-active-item");
  });
});
