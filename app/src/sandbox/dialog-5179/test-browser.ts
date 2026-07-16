import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/5179
  test("lets a child handle Escape before the dialog", async ({ page, q }) => {
    await q.button("Open dialog").click();
    await test.expect(q.dialog("Dialog")).toBeVisible();
    await test.expect(q.combobox("Search")).toBeFocused();
    await test.expect(q.listbox("Suggestions")).toBeVisible();

    await page.keyboard.press("Escape");

    await test.expect(q.listbox("Suggestions")).toBeHidden();
    await test.expect(q.dialog("Dialog")).toBeVisible();

    await page.keyboard.press("Escape");

    await test.expect(q.dialog("Dialog")).toBeHidden();
  });
});
