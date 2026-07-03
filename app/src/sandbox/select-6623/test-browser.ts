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

  test("discards the redirect when the option loses focus before the listbox is available", async ({
    page,
    q,
  }) => {
    await q.checkbox("Show search").click();
    await q.combobox("Favorite fruit").click();
    await test.expect(q.listbox()).toBeVisible();
    await test.expect(q.textbox("Search fruits")).toBeFocused();
    // Give a stray redirect a chance to fire before asserting focus stayed
    // put.
    await page.waitForTimeout(200);
    await test.expect(q.textbox("Search fruits")).toBeFocused();
  });
});
