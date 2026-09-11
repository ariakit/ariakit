import { withFramework } from "#app/test-utils/preview.ts";

withFramework(
  import.meta.dirname,
  { route: "dialog" },
  async ({ test, query }) => {
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

    test("washes the page behind a brand dialog, not the brand color", async ({
      page,
      q,
    }) => {
      const getColors = (node: Element) => {
        // Ariakit renders the backdrop as the element right before the dialog.
        const backdrop = node.previousElementSibling;
        return {
          dialog: getComputedStyle(node).backgroundColor,
          backdrop: backdrop ? getComputedStyle(backdrop).backgroundColor : "",
        };
      };
      await q.button("View receipt").click();
      const plain = await q.dialog("Success").evaluate(getColors);
      await page.keyboard.press("Escape");
      await test.expect(q.dialog("Success")).toBeHidden();

      await q.button("Upgrade").click();
      const brandDialog = q.dialog("Upgrade to Pro");
      await test.expect(brandDialog).toBeVisible();
      const brand = await brandDialog.evaluate(getColors);
      test.expect(plain.backdrop).not.toBe("");
      test.expect(brand.dialog).not.toBe(plain.dialog);
      test.expect(brand.backdrop).toBe(plain.backdrop);
    });

    test("drops the dialog and backdrop motion when the user prefers reduced motion", async ({
      page,
      q,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await q.button("View receipt").click();
      const dialog = q.dialog("Success");
      await test.expect(dialog).toBeVisible();
      await test.expect(dialog).toHaveCSS("transition-property", "none");
      const backdropTransition = await dialog.evaluate((node) => {
        const backdrop = node.previousElementSibling;
        if (!backdrop) return "";
        return getComputedStyle(backdrop).transitionProperty;
      });
      test.expect(backdropTransition).toBe("none");
    });
  },
);
