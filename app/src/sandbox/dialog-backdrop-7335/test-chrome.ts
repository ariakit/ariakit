import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  // Gaining or losing the backdrop must only mount or unmount the backdrop.
  // https://github.com/ariakit/ariakit/issues/7335
  test("backdrop toggle keeps the contents of a modal dialog", async ({
    page,
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

    const dialogId = await dialog.getAttribute("id");
    // Guards the selector below against a missing id.
    test.expect(dialogId).toBeTruthy();
    await query(dialog).checkbox("Dim the background").click();
    // Role queries skip elements hidden from the accessibility tree, so this
    // asserts that no backdrop is shown, not that no element is mounted.
    await test.expect(q.presentation()).toHaveCount(0);
    // Losing the backdrop has to unmount it, not just hide it. This passes
    // before the fix too, and rules out the userland workaround's shape, which
    // keeps a hidden backdrop mounted.
    await test
      .expect(page.locator(`[data-backdrop="${dialogId}"]`))
      .toHaveCount(0);
    await test.expect(query(dialog).textbox("Message")).toHaveValue("Ship it");
    await test.expect(query(dialog).status()).toHaveText("Attachments: 2");

    await query(dialog).checkbox("Dim the background").click();
    await test.expect(q.presentation()).toBeVisible();
    await test.expect(query(dialog).textbox("Message")).toHaveValue("Ship it");
    await test.expect(query(dialog).status()).toHaveText("Attachments: 2");
  });

  // Keeps the backdrop truthy, so this passes before the fix too: it's the
  // control that separates the falsy/truthy boundary from an ordinary
  // re-render.
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

  // The same toggle on an inline, non-modal dialog.
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
