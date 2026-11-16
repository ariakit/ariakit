import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("closes the dialog when the form is sent", async ({ page, q }) => {
    const disclosure = q.button("Invite people");
    await disclosure.click();
    const dialog = q.dialog("Invite to Acme");
    await test
      .expect(dialog)
      .toHaveAccessibleDescription(/People you invite can see every project/);
    const field = query(dialog).textbox("Email address");
    await test.expect(field).toBeFocused();
    await field.fill("kenji@example.com");
    await page.keyboard.press("Enter");
    await test.expect(dialog).toBeHidden();
    await test.expect(disclosure).toBeFocused();
  });
});
