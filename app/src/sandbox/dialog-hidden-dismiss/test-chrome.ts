import { createDismissAccessibilityReader } from "#app/test-utils/accessibility.ts";
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  // Modal dialogs keep the fallback dismiss button so that screen reader users
  // aren't trapped in them. It renders next to the dialog rather than inside
  // it, so a dialog element whose role doesn't allow a `button` among its
  // owned elements doesn't get one.
  // https://github.com/ariakit/ariakit/issues/4270
  // https://github.com/ariakit/ariakit/issues/7310
  test("modal dialog without a dismiss element gets a hidden one", async ({
    q,
  }) => {
    await q.button("Terms").click();
    const dialog = q.dialog("Terms");
    await test.expect(dialog).toBeVisible();
    await test.expect(q.button("Dismiss popup")).toBeVisible();
    await test.expect(query(dialog).button()).toHaveCount(0);
  });

  // Rendering it next to the dialog puts it outside every "inside the dialog"
  // check, so the dialog has to keep treating it as its own. The modal
  // backdrop absorbs a pointer click on it, so dispatch the click the way
  // assistive technology activation does.
  // https://github.com/ariakit/ariakit/issues/7310
  test("hidden dismiss closes the dialog and restores focus", async ({ q }) => {
    await q.button("Terms").click();
    await test.expect(q.dialog("Terms")).toBeVisible();

    await q.button("Dismiss popup").focus();
    await q.button("Dismiss popup").dispatchEvent("click");

    await test.expect(q.dialog("Terms")).toBeHidden();
    await test.expect(q.button("Terms")).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/7310
  test("escape closes the dialog from the hidden dismiss", async ({
    page,
    q,
  }) => {
    await q.button("Terms").click();
    await test.expect(q.dialog("Terms")).toBeVisible();

    await q.button("Dismiss popup").focus();
    await page.keyboard.press("Escape");

    await test.expect(q.dialog("Terms")).toBeHidden();
    await test.expect(q.button("Terms")).toBeFocused();
  });

  // The outer dialog's hidden dismiss button renders next to it, so a nested
  // dialog disables it along with everything else outside the nested one. That
  // is correct while the nested dialog is open, and it has to be undone when
  // the nested dialog closes, or the outer dialog is left with a dismiss button
  // that assistive technology can no longer reach.
  // https://github.com/ariakit/ariakit/issues/7310
  test("nested dialog disables the hidden dismiss and restores it", async ({
    page,
    q,
  }) => {
    const readDismissExposed = await createDismissAccessibilityReader(page);

    await q.button("Shipping").click();
    await test.expect(q.dialog("Shipping")).toBeVisible();
    await test.expect.poll(readDismissExposed).toBe(true);

    // This sandbox has no styles, so the backdrop paints over the dialog and
    // absorbs a pointer click on anything inside it. Activate from the
    // keyboard, which is how a screen reader user reaches these anyway.
    await q.button("Edit address").press("Enter");
    await test.expect(q.dialog("Edit address")).toBeVisible();
    await test.expect.poll(readDismissExposed).toBe(false);

    await q.button("Save").press("Enter");
    await test.expect(q.dialog("Edit address")).toHaveCount(0);
    await test.expect.poll(readDismissExposed).toBe(true);

    await q.button("Dismiss popup").focus();
    await q.button("Dismiss popup").dispatchEvent("click");
    await test.expect(q.dialog("Shipping")).toBeHidden();
  });

  // https://github.com/ariakit/ariakit/issues/7310
  test("hidden dismiss doesn't count as outside a dialog that never took focus", async ({
    q,
  }) => {
    await q.button("Preferences").click();
    await test.expect(q.dialog("Preferences")).toBeVisible();

    await q.button("Dismiss popup").focus();

    // The button is still there to be focused, which is already half the
    // assertion: closing the dialog would take it with it.
    await test.expect(q.button("Dismiss popup")).toBeFocused();
    await test.expect(q.dialog("Preferences")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/4270
  test("modal dialog with a dismiss element gets no hidden one", async ({
    q,
  }) => {
    await q.button("Receipt").click();
    const dialog = q.dialog("Receipt");
    await test.expect(dialog).toBeVisible();
    await test.expect(q.button("Dismiss popup")).toHaveCount(0);
    await test.expect(query(dialog).button()).toHaveCount(1);
    await test.expect(query(dialog).button("Done")).toBeVisible();
  });

  // A nested popover renders inline inside the dialog and stays rendered while
  // closed, so its dismiss button is in the dialog's subtree before the user
  // opens the popover. It closes the popover, so the dialog still needs its own
  // fallback. https://github.com/ariakit/ariakit/issues/7321
  test("dismiss owned by a nested popup doesn't replace the hidden one", async ({
    q,
  }) => {
    await q.button("Compose").click();
    const dialog = q.dialog("Compose");
    await test.expect(dialog).toBeVisible();
    await test
      .expect(query(dialog).button("Close formatting", { includeHidden: true }))
      .toHaveCount(1);
    await test.expect(q.button("Dismiss popup")).toBeVisible();

    await q.button("Formatting").press("Enter");
    await test.expect(q.dialog("Formatting")).toBeVisible();
    // The popover being open is when its dismiss button is on screen, and the
    // dialog still has no dismiss of its own.
    await test.expect(q.button("Dismiss popup")).toBeVisible();

    await q.button("Close formatting").press("Enter");
    await test.expect(q.dialog("Formatting")).toBeHidden();
    await test.expect(dialog).toBeVisible();
    await test.expect(q.button("Dismiss popup")).toBeVisible();
  });

  // A dismiss button the dialog does own is still its own when a nested popup's
  // comes first in document order, and when it sits in a wrapper element rather
  // than directly under the dialog.
  // https://github.com/ariakit/ariakit/issues/7321
  test("dialog owning a dismiss after a nested popup's gets no hidden one", async ({
    q,
  }) => {
    await q.button("Share").click();
    const dialog = q.dialog("Share");
    await test.expect(dialog).toBeVisible();
    await test
      .expect(
        query(dialog).button("Close permissions", { includeHidden: true }),
      )
      .toHaveCount(1);
    await test.expect(query(dialog).button("Cancel")).toBeVisible();
    await test.expect(q.button("Dismiss popup")).toHaveCount(0);
  });

  // The same composition through the menu modules. A submenu is never modal, so
  // it renders inline inside the modal menu, and its dismiss button closes the
  // submenu alone. https://github.com/ariakit/ariakit/issues/7321
  test("dismiss owned by a submenu doesn't replace the hidden one", async ({
    q,
  }) => {
    await q.button("Tools").click();
    const menu = q.menu("Tools");
    await test.expect(menu).toBeVisible();
    await test
      .expect(query(menu).button("Close submenu", { includeHidden: true }))
      .toHaveCount(1);
    await test.expect(q.button("Dismiss popup")).toBeVisible();

    // Same again once the submenu is open, which is when its dismiss button is
    // on screen and the modal menu still has no dismiss of its own.
    await q.menuitem("More").press("Enter");
    await test.expect(q.menu("More")).toBeVisible();
    await test.expect(q.button("Dismiss popup")).toBeVisible();
  });

  // Whether the dialog needs the fallback can change while it stays open. A
  // dialog that loads its content gains a dismiss control, and the fallback has
  // to step aside instead of leaving two of them behind.
  // https://github.com/ariakit/ariakit/issues/7321
  test("dismiss mounted while the dialog is open replaces the hidden one", async ({
    q,
  }) => {
    await q.button("Activity").click();
    const dialog = q.dialog("Activity");
    await test.expect(dialog).toBeVisible();
    await test.expect(q.button("Dismiss popup")).toBeVisible();

    await q.button("Load entries").press("Enter");
    await test.expect(query(dialog).button("Close")).toBeVisible();
    await test.expect(q.button("Dismiss popup")).toHaveCount(0);
  });

  // The other direction: a dialog that starts a task it can't cancel loses the
  // dismiss control it had, and the fallback has to come back.
  // https://github.com/ariakit/ariakit/issues/7321
  test("dismiss unmounted while the dialog is open brings the hidden one back", async ({
    q,
  }) => {
    await q.button("Remove photo").click();
    const dialog = q.dialog("Remove photo");
    await test.expect(dialog).toBeVisible();
    await test.expect(q.button("Dismiss popup")).toHaveCount(0);

    await q.button("Remove").press("Enter");
    await test.expect(query(dialog).button("Keep photo")).toHaveCount(0);
    await test.expect(q.button("Dismiss popup")).toBeVisible();
  });
});
