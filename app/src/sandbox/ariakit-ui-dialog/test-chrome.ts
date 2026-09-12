import { countAnimations } from "#app/test-utils/ariakit-ui.ts";
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("moves focus into the dialog and back to its disclosure on Escape", async ({
    page,
    q,
  }) => {
    const disclosure = q.button("View receipt");
    await disclosure.click();
    const dialog = q.dialog("Success");
    await test.expect(dialog).toBeVisible();
    await test.expect(query(dialog).button("OK")).toBeFocused();
    // The dialog renders in a portal, outside its box.
    await test.expect(query(q.article("Default")).dialog()).toHaveCount(0);
    await page.keyboard.press("Escape");
    await test.expect(dialog).toBeHidden();
    await test.expect(disclosure).toBeFocused();
  });

  test("closes the dialog from its dismiss", async ({ q }) => {
    const disclosure = q.button("Invite member");
    await disclosure.click();
    const dialog = q.dialog("Invite sent");
    await test.expect(dialog).toBeVisible();
    await query(dialog).button("Dismiss popup").click();
    await test.expect(dialog).toBeHidden();
    await test.expect(disclosure).toBeFocused();
  });

  test("submits the form and closes the dialog with the new name", async ({
    q,
  }) => {
    const box = query(q.article("Form"));
    await test.expect(box.text("Current name: Ariakit UI")).toBeVisible();
    await box.button("Rename project").click();
    const dialog = q.dialog("Rename project");
    const field = query(dialog).textbox("Project name");
    await test.expect(field).toBeFocused();
    await field.fill("Ariakit Docs");
    await query(dialog).button("Save").click();
    await test.expect(dialog).toBeHidden();
    await test.expect(box.text("Current name: Ariakit Docs")).toBeVisible();
    await test.expect(box.button("Rename project")).toBeFocused();
  });

  test("keeps the saved name when the form is canceled", async ({ q }) => {
    const box = query(q.article("Form"));
    await box.button("Rename project").click();
    const dialog = q.dialog("Rename project");
    await query(dialog).textbox("Project name").fill("Discarded");
    await query(dialog).button("Cancel").click();
    await test.expect(dialog).toBeHidden();
    await test.expect(box.text("Current name: Ariakit UI")).toBeVisible();
    // The dialog unmounts on close, so the field starts from the saved name.
    await box.button("Rename project").click();
    await test
      .expect(query(dialog).textbox("Project name"))
      .toHaveValue("Ariakit UI");
  });

  // Initial focus lands on the action after the body, and the body must not
  // scroll to reach it, so the first section stays readable.
  test("focuses the action after a long body without scrolling the body", async ({
    q,
  }) => {
    await q.button("Terms of service").click();
    const dialog = q.dialog("Terms of service");
    await test.expect(query(dialog).button("Agree")).toBeFocused();
    const body = dialog.locator("p").first().locator("..");
    test.expect(await body.evaluate((node) => node.scrollTop)).toBe(0);
  });

  test("closes the nested dialog first on Escape", async ({ page, q }) => {
    const disclosure = q.button("Project settings");
    await disclosure.click();
    const outer = q.dialog("Project settings");
    await test.expect(outer).toBeVisible();
    const innerDisclosure = query(outer).button("Delete project");
    await innerDisclosure.click();
    const inner = q.dialog("Delete project?");
    await test.expect(inner).toBeVisible();
    await test.expect(query(inner).button("Cancel")).toBeFocused();

    await page.keyboard.press("Escape");
    await test.expect(inner).toBeHidden();
    await test.expect(outer).toBeVisible();
    await test.expect(innerDisclosure).toBeFocused();

    await page.keyboard.press("Escape");
    await test.expect(outer).toBeHidden();
    await test.expect(disclosure).toBeFocused();
  });

  // The entry transitions run for a few hundred milliseconds from the frame
  // that shows the dialog, so a regression is still running when the visibility
  // assertion passes.
  test("runs no dialog or backdrop animation when the user prefers reduced motion", async ({
    page,
    q,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await q.button("View receipt").click();
    const dialog = q.dialog("Success");
    await test.expect(dialog).toBeVisible();
    test.expect(await countAnimations(dialog, true)).toBe(0);
  });

  // https://github.com/ariakit/ariakit/pull/7465#discussion_r3992662589
  test("names an icon-only dismiss whose label prop is undefined", async ({
    q,
  }) => {
    await q.button("View messages").click();
    const dialog = q.dialog("Messages");
    await test.expect(dialog).toBeVisible();
    await query(dialog).button("Dismiss popup").click();
    await test.expect(dialog).toBeHidden();
  });
});
