import { countAnimations } from "#app/test-utils/ariakit-ui.ts";
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("moves between sections and saves", async ({ q }) => {
    const disclosure = q.button("Open settings");
    await disclosure.click();
    const dialog = q.dialog("Settings");
    await test.expect(query(dialog).heading("General")).toBeVisible();
    await query(dialog).link("Members").click();
    await test.expect(query(dialog).heading("Members")).toBeVisible();
    await test
      .expect(query(dialog).link("Members"))
      .toHaveAttribute("aria-current", "page");
    await query(dialog).button("Save changes").click();
    await test.expect(dialog).toBeHidden();
    await test.expect(q.status()).toHaveText("Settings saved");
    await test.expect(disclosure).toBeFocused();
  });

  // The header of main sits on the shell inset, so the close button is as far
  // from the end edge as from the top edge of the header.
  test("keeps the close button on the corner inset", async ({ q }) => {
    await q.button("Open settings").click();
    const dialog = q.dialog("Settings");
    const dismiss = query(dialog).button("Dismiss popup");
    await test.expect(dismiss).toBeVisible();
    await test.expect
      .poll(async () => {
        const dialogBox = await dialog.boundingBox();
        const dismissBox = await dismiss.boundingBox();
        if (!dialogBox || !dismissBox) return null;
        const end =
          dialogBox.x + dialogBox.width - dismissBox.x - dismissBox.width;
        const top = dismissBox.y - dialogBox.y;
        return Math.abs(end - top) <= 2;
      })
      .toBe(true);
  });

  // The sidebar fits the scroll area of the dialog, not the window, so it has
  // room to stick while main scrolls.
  test("keeps the sidebar in place when main scrolls", async ({ page, q }) => {
    await q.button("Open settings").click();
    const dialogElement = q.dialog("Settings");
    const dialog = query(dialogElement);
    const nav = dialog.navigation("Sections");
    const field = dialog.textbox("Workspace name");
    // The dialog scales in, so the boxes move until it ends.
    await test.expect.poll(() => countAnimations(dialogElement)).toBe(0);
    const navBox = await nav.boundingBox();
    const fieldBox = await field.boundingBox();
    await field.hover();
    await page.mouse.wheel(0, 400);
    await test.expect
      .poll(async () => (await field.boundingBox())?.y)
      .toBeLessThan((fieldBox?.y ?? 0) - 40);
    test.expect((await nav.boundingBox())?.y).toBeCloseTo(navBox?.y ?? 0, 0);
  });
});
