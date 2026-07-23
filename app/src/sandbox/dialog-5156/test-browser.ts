import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("does not throw when a document event has a non-Node target", async ({
    page,
    q,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));

    // Open the dialog so Ariakit attaches its document listeners (the
    // interact-outside click/focusin/contextmenu listeners and the
    // Escape-to-close keydown listener).
    await q.button("Show dialog").click();
    await test.expect(q.dialog("Dialog")).toBeVisible();
    await test.expect(q.button("OK")).toBeFocused();

    // Some third-party code dispatches events whose target is a non-Node
    // EventTarget (such as window or an XMLHttpRequest). Those listeners used
    // to call `contains()` on the target, throwing a TypeError (in Chromium,
    // "Failed to execute 'contains' on 'Node': parameter 1 is not of type
    // 'Node'"; the wording varies by engine).
    // See https://github.com/ariakit/ariakit/issues/5156
    await page.evaluate(() => {
      // `event.target` is read-only and set during dispatch, so shadow it with
      // a bare EventTarget to stand in for the non-Node target.
      const dispatch = (event: Event) => {
        Object.defineProperty(event, "target", {
          configurable: true,
          value: new EventTarget(),
        });
        document.dispatchEvent(event);
      };
      for (const type of ["click", "focusin", "contextmenu"]) {
        dispatch(new Event(type, { bubbles: true }));
      }
      // Escape would close the dialog; its listener handles the target too.
      dispatch(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });
    // A foreign mousedown target can remain recorded until a standalone
    // outside click occurs without replacing it.
    await page.evaluate(() => {
      const event = new MouseEvent("mousedown", { bubbles: true });
      Object.defineProperty(event, "target", {
        configurable: true,
        value: new EventTarget(),
      });
      document.dispatchEvent(event);
    });
    await q
      .button("Outside target")
      .evaluate((button) =>
        button.dispatchEvent(new MouseEvent("click", { bubbles: true })),
      );

    // The dialog stays open: a foreign event is neither an interaction inside
    // nor a deliberate interaction outside. This await also gives any page
    // error from the dispatch above time to surface before we assert on it.
    await test.expect(q.dialog("Dialog")).toBeVisible();
    test.expect(errors).toEqual([]);
  });
});
