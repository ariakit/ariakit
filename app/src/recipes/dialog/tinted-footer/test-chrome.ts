import { countAnimations } from "#app/test-utils/ariakit-ui.ts";
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("closes the dialog when the form is sent", async ({ page, q }) => {
    const disclosure = q.button("Invite people");
    await disclosure.click();
    const dialog = q.dialog("Invite to Acme");
    const field = query(dialog).textbox("Email address");
    await test.expect(field).toBeFocused();
    await field.fill("kenji@example.com");
    await page.keyboard.press("Enter");
    await test.expect(dialog).toBeHidden();
    await test.expect(disclosure).toBeFocused();
  });

  // The cover frame takes the padding of the dialog, so its buttons line up
  // with the field, and it reaches the bottom edge of the dialog. It stops
  // inside the 1px edge of the dialog, so both can differ by that pixel.
  test("puts the footer on the bottom edge of the dialog", async ({ q }) => {
    await q.button("Invite people").click();
    const dialog = q.dialog("Invite to Acme");
    // The dialog scales in, so the boxes move until it ends.
    await test.expect.poll(() => countAnimations(dialog)).toBe(0);
    const footer = query(dialog).button("Cancel").locator("..");
    const field = query(dialog).textbox("Email address");
    const cancel = query(dialog).button("Cancel");
    await test.expect
      .poll(async () => {
        const dialogBox = await dialog.boundingBox();
        const footerBox = await footer.boundingBox();
        if (!dialogBox || !footerBox) return null;
        const gap =
          dialogBox.y + dialogBox.height - footerBox.y - footerBox.height;
        return Math.abs(gap) <= 1;
      })
      .toBe(true);
    const fieldBox = await field.boundingBox();
    const cancelBox = await cancel.boundingBox();
    test
      .expect(Math.abs((cancelBox?.x ?? 0) - (fieldBox?.x ?? 0)))
      .toBeLessThanOrEqual(1);
  });
});
