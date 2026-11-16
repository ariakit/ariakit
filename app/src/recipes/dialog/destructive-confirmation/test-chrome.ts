import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("starts on Cancel and stays open on a click outside", async ({
    page,
    q,
  }) => {
    await q.button("Delete project").click();
    const dialog = q.alertdialog("Delete “Website redesign”?");
    await test.expect(query(dialog).button("Cancel")).toBeFocused();
    await page.mouse.click(8, 8);
    // The alert dialog stays open; its exit transition would keep it visible.
    await test.expect(dialog).toHaveAttribute("data-open");
  });

  test("deletes the project and keeps focus on the disabled button", async ({
    q,
  }) => {
    const disclosure = q.button("Delete project");
    await disclosure.click();
    const dialog = q.alertdialog("Delete “Website redesign”?");
    await query(dialog).button("Delete").click();
    await test.expect(dialog).toBeHidden();
    await test.expect(q.status()).toHaveText("Website redesign was deleted");
    await test.expect(disclosure).toBeDisabled();
    await test.expect(disclosure).toBeFocused();
  });
});
