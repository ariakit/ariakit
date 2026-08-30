import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  // Gaining or losing the backdrop must only mount or unmount the backdrop.
  // The backdrop renders as a sibling before the dialog, so rendering that
  // sibling only while the prop is truthy moves the dialog to another position
  // among its parent's children, and React remounts everything inside it.
  // https://github.com/ariakit/ariakit/issues/7335
  test("backdrop toggle keeps the contents of a modal dialog", async ({
    q,
  }) => {
    await q.button("Compose").click();
    const dialog = q.dialog("Compose");
    await test.expect(dialog).toBeVisible();
    await query(dialog).textbox("Message").fill("Ship it");
    await query(dialog).button("Add attachment").click();
    await query(dialog).button("Add attachment").click();
    await test.expect(query(dialog).status()).toHaveText("Attachments: 2");
    await test.expect(q.presentation()).toBeVisible();

    await query(dialog).checkbox("Dim the background").click();
    // Role queries skip elements hidden from the accessibility tree, so this
    // asserts that no backdrop is shown, not that no element is mounted.
    await test.expect(q.presentation()).toHaveCount(0);
    await test.expect(query(dialog).textbox("Message")).toHaveValue("Ship it");
    await test.expect(query(dialog).status()).toHaveText("Attachments: 2");

    await query(dialog).checkbox("Dim the background").click();
    await test.expect(q.presentation()).toBeVisible();
    await test.expect(query(dialog).textbox("Message")).toHaveValue("Ship it");
    await test.expect(query(dialog).status()).toHaveText("Attachments: 2");
  });

  // Changing the backdrop's own appearance re-renders the dialog with a new
  // backdrop element while the backdrop stays truthy, so the number of children
  // never changes. This passes today: it's the control that tells the
  // falsy/truthy boundary apart from an ordinary re-render.
  // https://github.com/ariakit/ariakit/issues/7335
  test("changing the backdrop's appearance keeps the contents", async ({
    q,
  }) => {
    await q.button("Compose").click();
    const dialog = q.dialog("Compose");
    await test.expect(dialog).toBeVisible();
    await query(dialog).textbox("Message").fill("Ship it");
    await query(dialog).button("Add attachment").click();
    await test.expect(q.presentation()).not.toHaveClass(/backdrop-high/);

    await query(dialog).checkbox("High contrast backdrop").click();
    await test.expect(q.presentation()).toHaveClass(/backdrop-high/);
    await test.expect(query(dialog).textbox("Message")).toHaveValue("Ship it");
    await test.expect(query(dialog).status()).toHaveText("Attachments: 1");
  });

  // A dialog that renders inline is reconciled among its own parent's children
  // rather than the portal's, so it needs the same stable position.
  // https://github.com/ariakit/ariakit/issues/7335
  test("backdrop toggle keeps the contents of an inline dialog", async ({
    q,
  }) => {
    await q.button("Quick note").click();
    const dialog = q.dialog("Quick note");
    await test.expect(dialog).toBeVisible();
    await query(dialog).textbox("Note").fill("Buy milk");
    await query(dialog).button("Add attachment").click();
    await test.expect(query(dialog).status()).toHaveText("Attachments: 1");
    await test.expect(q.presentation()).toBeVisible();

    await query(dialog).checkbox("Dim the background").click();
    await test.expect(q.presentation()).toHaveCount(0);
    await test.expect(query(dialog).textbox("Note")).toHaveValue("Buy milk");
    await test.expect(query(dialog).status()).toHaveText("Attachments: 1");

    await query(dialog).checkbox("Dim the background").click();
    await test.expect(q.presentation()).toBeVisible();
    await test.expect(query(dialog).textbox("Note")).toHaveValue("Buy milk");
    await test.expect(query(dialog).status()).toHaveText("Attachments: 1");
  });
});
