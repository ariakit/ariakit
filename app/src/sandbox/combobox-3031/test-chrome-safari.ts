import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  // https://github.com/ariakit/ariakit/issues/3031
  test("lets native focusin win over the iframe fallback", async ({ page }) => {
    const frame = query(page.frameLocator("iframe[title='Embedded content']"));
    const focusTimingFrame = query(
      page.frameLocator("iframe[title='Focus timing frame']"),
    );
    await frame.button("Open focus timing dialog").click();
    await test.expect(frame.dialog("Focus timing dialog")).toBeFocused();

    // The dialog itself is programmatically focused, so the first Tab resumes
    // the frame's document order at the combobox and the second enters the
    // sibling frame.
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    await test
      .expect(focusTimingFrame.textbox("Focus timing target"))
      .toBeFocused();
    await test.expect(frame.dialog("Focus timing dialog")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/3031
  test("observes focus from a navigating iframe load handler", async ({
    page,
  }) => {
    const frame = query(page.frameLocator("iframe[title='Embedded content']"));
    const navigatedFrame = query(
      page.frameLocator("iframe[title='Focus navigated frame']"),
    );
    await frame.button("Open lifecycle dialog").click();

    await frame.button("Navigate and focus outside frame").click();

    await test
      .expect(navigatedFrame.textbox("Load focus target"))
      .toBeFocused();
    await test.expect(frame.dialog("Lifecycle dialog")).not.toBeVisible();
  });
});
