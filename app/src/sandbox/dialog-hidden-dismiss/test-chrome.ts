import { createDismissAccessibilityReader } from "#app/test-utils/accessibility.ts";
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
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

  // The gift note is modal, so the hidden dismiss button of the checkout must
  // not stay exposed next to it, also when React creates a new button while the
  // gift note is open.
  // https://github.com/ariakit/ariakit/issues/7775
  test("later dialog disables the hidden dismiss of a dialog that moves out of a portal", async ({
    page,
    q,
  }) => {
    const readDismissExposed = await createDismissAccessibilityReader(page);

    await q.button("Checkout").click();
    await test.expect(q.dialog("Checkout")).toBeVisible();
    await test.expect.poll(readDismissExposed).toBe(true);

    // This sandbox has no styles, so the backdrop paints over the dialog and
    // absorbs a pointer click on anything inside it.
    await q.button("Add gift note").press("Enter");
    await test.expect(q.textbox("Note")).toBeFocused();
    // The gift note disables the portal of the checkout, which has the button.
    await test.expect.poll(readDismissExposed).toBe(false);
    const dismissInPortal = await q.button("Dismiss popup").elementHandle();

    // The note has text, so the checkout moves out of its portal to the body,
    // and React creates a new hidden dismiss button there.
    await page.keyboard.type("a");
    await test.expect
      .poll(() => dismissInPortal.evaluate((el) => el.isConnected))
      .toBe(false);
    await test.expect(q.button("Dismiss popup")).toHaveCount(1);
    await test.expect.poll(readDismissExposed).toBe(false);

    // The gift note opened last, so Escape closes it, and the checkout must get
    // its dismiss button back.
    await page.keyboard.press("Escape");
    await test.expect(q.dialog("Gift note")).toHaveCount(0);
    await test.expect.poll(readDismissExposed).toBe(true);
  });

  // The hidden dismiss button can also mount while the later dialog is open,
  // when the earlier dialog keeps its element and loses its own dismiss button.
  // https://github.com/ariakit/ariakit/issues/7775
  // https://github.com/ariakit/ariakit/issues/7782
  test("later dialog disables the hidden dismiss that mounts while it is open", async ({
    page,
    q,
  }) => {
    const readDismissExposed = await createDismissAccessibilityReader(page);

    await q.button("Refund").click();
    await test.expect(q.dialog("Refund")).toBeVisible();
    await test.expect(q.button("Keep order")).toBeVisible();
    await test.expect(q.button("Dismiss popup")).toHaveCount(0);

    // This sandbox has no styles, so the backdrop paints over the dialog and
    // absorbs a pointer click on anything inside it.
    await q.button("Add reason").press("Enter");
    await test.expect(q.textbox("Reason")).toBeFocused();

    // The reason has text, so the refund loses its dismiss button and gets the
    // hidden one.
    await page.keyboard.type("a");
    await test.expect(q.button("Dismiss popup")).toHaveCount(1);
    await test.expect.poll(readDismissExposed).toBe(false);

    // The reason opened last, so Escape closes it, and the refund must get its
    // dismiss button back.
    await page.keyboard.press("Escape");
    await test.expect(q.dialog("Reason")).toBeHidden();
    await test.expect.poll(readDismissExposed).toBe(true);

    await q.button("Dismiss popup").focus();
    await q.button("Dismiss popup").dispatchEvent("click");
    await test.expect(q.dialog("Refund")).toBeHidden();
  });
});
