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
});
