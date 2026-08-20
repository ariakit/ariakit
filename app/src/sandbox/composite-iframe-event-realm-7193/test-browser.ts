import { withFramework } from "#app/test-utils/preview.ts";

// This fixture has no happy-dom duplicate: happy-dom shares one set of
// constructors between a frame and its parent, so both realms answer
// `instanceof` the same way and the assertions below would pass either way.
withFramework(import.meta.dirname, async ({ test, query }) => {
  // https://github.com/ariakit/ariakit/issues/7193
  test("forwards the keyboard event built by the frame's own window", async ({
    page,
    q,
  }) => {
    const frame = query(page.frameLocator("iframe[title='Editor frame']"));
    const events = query(q.list("Item keyboard events")).listitem();
    await frame.button("Bold").click();

    await page.keyboard.press("ArrowRight");
    await test.expect(events).toHaveText(["KeyboardEvent, own window"]);
  });

  // https://github.com/ariakit/ariakit/issues/7193
  //
  // Moving the active item blurs the previous one, a separate path from the
  // keyboard proxy above.
  test("blurs the previous item with an event built by the frame's own window", async ({
    page,
    q,
  }) => {
    const frame = query(page.frameLocator("iframe[title='Editor frame']"));
    const events = query(q.list("Item blur events")).listitem();
    await frame.button("Bold").click();

    await page.keyboard.press("ArrowRight");
    await test.expect(events).toHaveText(["FocusEvent, own window"]);
  });
});
