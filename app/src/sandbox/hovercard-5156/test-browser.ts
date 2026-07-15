import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("does not throw when a focusout has a non-Node relatedTarget", async ({
    page,
    q,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));

    // Focusing the disclosure shows it and attaches its global focusout listener
    // to the document; pressing Enter then opens the hovercard. Waiting for the
    // hovercard content confirms that flow completed before we dispatch below.
    await q.button("More details").focus();
    await page.keyboard.press("Enter");
    await test
      .expect(q.text("Toolkit for building accessible web apps."))
      .toBeVisible();

    // A focusout whose relatedTarget is a non-Node EventTarget (such as one
    // dispatched on window or an XMLHttpRequest) used to make the listener call
    // `contains()` on it and throw a TypeError.
    // See https://github.com/ariakit/ariakit/issues/5156
    await page.evaluate(() => {
      document.dispatchEvent(
        new FocusEvent("focusout", {
          bubbles: true,
          relatedTarget: new EventTarget(),
        }),
      );
    });

    // Round-trip so any page error from the dispatch above is delivered before
    // we assert on it.
    await page.evaluate(() => {});
    test.expect(errors).toEqual([]);
  });
});
