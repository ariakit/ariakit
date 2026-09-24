import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // The fix for #7616 runs onClose before the open state changes, so the
  // outside interaction must be recorded before the close request for this to
  // hold.
  // https://github.com/ariakit/ariakit/issues/7616
  test("closes on a synchronous outside click without restoring disclosure focus", async ({
    page,
    q,
  }) => {
    await q.button("Show details").click();
    await test.expect(q.dialog("Details")).toBeVisible();

    await q.text("Text outside the details").click();
    await test.expect(q.dialog("Details")).toBeHidden();
    await test.expect(page.locator("body")).toBeFocused();
  });

  // The fix for #7616 runs onClose before the open state changes, so hiding the
  // store from onClose must not dispatch the close event again.
  // https://github.com/ariakit/ariakit/issues/7616
  test("closes once when onClose hides the store on Escape", async ({
    page,
    q,
  }) => {
    await q.button("Show settings").click();
    await test.expect(q.dialog("Settings")).toBeVisible();

    await page.keyboard.press("Escape");
    await test.expect(q.dialog("Settings")).toBeHidden();
    await test.expect(q.text("Settings close events: 1")).toBeVisible();
  });
});
