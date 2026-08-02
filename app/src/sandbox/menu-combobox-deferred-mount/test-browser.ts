import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("focuses a deferred combobox after clicking the select", async ({
    q,
  }) => {
    await q.combobox("Current page").click();
    await test.expect(q.combobox("Search pages")).toBeFocused();
  });

  test("focuses a deferred combobox after opening the menu with a shortcut", async ({
    page,
    q,
  }) => {
    await page.keyboard.press("Control+k");
    await test.expect(q.combobox("Search pages")).toBeFocused();
  });
});
