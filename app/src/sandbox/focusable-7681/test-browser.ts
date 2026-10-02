import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // Inside a shadow root, the document reports the shadow host as the focused
  // element, so a check for focus on the element itself can't see it.
  // https://github.com/ariakit/ariakit/issues/7681
  test("shows focus-visible on a button focused with Tab in a shadow root", async ({
    page,
    q,
  }) => {
    await q.button("Document action").focus();
    await page.keyboard.press("Tab");

    const button = q.button("Shadow action");
    await test.expect(button).toBeFocused();
    await test.expect(button).toHaveAttribute("data-focus-visible", "true");
    await test
      .expect(q.text("Shadow action focus-visible calls: 1"))
      .toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/7681
  test("shows focus-visible on a combobox focused with Tab in a shadow root", async ({
    page,
    q,
  }) => {
    await q.button("Shadow action").focus();
    await page.keyboard.press("Tab");

    const combobox = q.combobox("Shadow fruit");
    await test.expect(combobox).toBeFocused();
    await test.expect(combobox).toHaveAttribute("data-focus-visible", "true");
    await test
      .expect(q.text("Shadow fruit focus-visible calls: 1"))
      .toBeVisible();
  });
});
