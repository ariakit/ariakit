import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("moves focus to the field and back to its disclosure on Escape", async ({
    page,
    q,
  }) => {
    const disclosure = q.button("Invite people");
    await disclosure.click();
    const dialog = q.dialog("Invite to Acme");
    await test.expect(dialog).toBeVisible();
    await test
      .expect(dialog)
      .toHaveAccessibleDescription(/People you invite can see every project/);
    await test.expect(query(dialog).textbox("Email address")).toBeFocused();
    await page.keyboard.press("Escape");
    await test.expect(dialog).toBeHidden();
    await test.expect(disclosure).toBeFocused();
  });

  test("closes the dialog from its close button", async ({ q }) => {
    const disclosure = q.button("Invite people");
    await disclosure.click();
    const dialog = q.dialog("Invite to Acme");
    await query(dialog).button("Dismiss popup").click();
    await test.expect(dialog).toBeHidden();
    await test.expect(disclosure).toBeFocused();
  });

  test("closes the dialog when the form is sent", async ({ page, q }) => {
    const disclosure = q.button("Invite people");
    await disclosure.click();
    const dialog = q.dialog("Invite to Acme");
    await query(dialog).textbox("Email address").fill("kenji@example.com");
    await page.keyboard.press("Enter");
    await test.expect(dialog).toBeHidden();
    await test.expect(disclosure).toBeFocused();
  });

  test("closes the dialog on a click outside", async ({ page, q }) => {
    await q.button("Invite people").click();
    const dialog = q.dialog("Invite to Acme");
    await test.expect(dialog).toBeVisible();
    await page.mouse.click(8, 8);
    await test.expect(dialog).toBeHidden();
  });

  // The close button is first in the DOM, but focus starts on the field. Tab
  // moves to the actions, and Shift+Tab from the field moves to the close
  // button.
  test("moves focus between the field, the actions, and the close button", async ({
    page,
    q,
  }) => {
    await q.button("Invite people").click();
    const dialog = q.dialog("Invite to Acme");
    const field = query(dialog).textbox("Email address");
    await test.expect(field).toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(query(dialog).button("Cancel")).toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(query(dialog).button("Send invite")).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Shift+Tab");
    await test.expect(field).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await test.expect(query(dialog).button("Dismiss popup")).toBeFocused();
  });

  // The close button moves into its own padding, so its hover surface is as far
  // from the top edge as from the end edge, in the corner of the dialog.
  test("keeps the close button on the corner inset", async ({ q }) => {
    await q.button("Invite people").click();
    const dialog = q.dialog("Invite to Acme");
    const close = query(dialog).button("Dismiss popup");
    await test.expect(close).toBeVisible();
    await test.expect
      .poll(async () => {
        const dialogBox = await dialog.boundingBox();
        const closeBox = await close.boundingBox();
        if (!dialogBox || !closeBox) return null;
        const end = dialogBox.x + dialogBox.width - closeBox.x - closeBox.width;
        const top = closeBox.y - dialogBox.y;
        return Math.abs(end - top) <= 1 && top < 12;
      })
      .toBe(true);
  });
});
