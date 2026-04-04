import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("open/close menu by clicking on menu button", async ({ q }) => {
    await q.button("Open dialog").click();
    await test.expect(q.dialog()).toBeVisible();
    await q.button("Menu").click();
    await test.expect(q.menu()).toBeVisible();
    await q.button("Menu").click();
    await test.expect(q.menu()).not.toBeVisible();
    await test.expect(q.dialog()).toBeVisible();
  });

  test("menu button receives focus after menu closes", async ({ q }) => {
    await q.button("Open dialog").click();
    await test.expect(q.dialog()).toBeVisible();
    const menuButton = q.button("Menu");
    await menuButton.click();
    await test.expect(q.menu()).toBeVisible();
    await menuButton.click();
    await test.expect(q.menu()).not.toBeVisible();
    await test.expect(menuButton).toBeFocused();
  });

  test("clicking non-interactive element before programmatic open does not hijack disclosure", async ({
    q,
    page,
  }) => {
    const openButton = q.button("Open dialog");

    // Open and close dialog normally (sets disclosure to openButton)
    await openButton.click();
    await test.expect(q.dialog()).toBeVisible();
    await page.keyboard.press("Escape");
    await test.expect(q.dialog()).not.toBeVisible();
    await test.expect(openButton).toBeFocused();

    // Click on non-interactive text (sets mousedown ref on Safari, but the
    // target is not focusable so isFocusable() guard filters it out)
    await q.text("Non-interactive text").click();

    // Open dialog programmatically via keyboard shortcut (no mousedown)
    await page.keyboard.press("F2");
    await test.expect(q.dialog()).toBeVisible();

    // Close dialog
    await page.keyboard.press("Escape");
    await test.expect(q.dialog()).not.toBeVisible();

    // Focus returns to the original disclosure (openButton) from the first
    // open. The non-interactive click did not hijack the disclosure because
    // the isFocusable() guard filtered out the non-focusable mousedown target.
    await test.expect(openButton).toBeFocused();
  });
});
