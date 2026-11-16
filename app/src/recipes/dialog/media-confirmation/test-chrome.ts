import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("archives the projects from the alert dialog", async ({ q }) => {
    const disclosure = q.button("Archive projects");
    await disclosure.click();
    const dialog = q.alertdialog("Archive 3 projects?");
    await test.expect(query(dialog).button("Cancel")).toBeFocused();
    await query(dialog).button("Archive").click();
    await test.expect(dialog).toBeHidden();
    await test.expect(q.status()).toHaveText("3 projects were archived");
    await test.expect(disclosure).toBeFocused();
  });
});
