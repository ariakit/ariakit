import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

// Firefox makes the iframe document its own tab stop, and Safari skips buttons
// during sequential focus navigation by default. Tab moves from the panel
// straight to the iframe button only in Chrome.
withFramework(import.meta.dirname, async ({ test, query }) => {
  // https://github.com/ariakit/ariakit/issues/7963
  test("tabs to the iframe button after focus leaves and returns to the portal", async ({
    page,
    q,
  }) => {
    const frame = query(
      page.frameLocator("iframe[title='Contract document preview']"),
    );
    await test.expect(frame.button("Download document")).toBeVisible();

    await q.button("Preview settings").click();
    await test.expect(q.button("Preview settings")).toBeFocused();
    await q.textbox("Document title").click();
    await test.expect(q.textbox("Document title")).toBeFocused();
    // Portal makes its tab stops temporarily not tabbable on the next animation
    // frame after focus leaves it. No user-visible state tracks that update.
    await flushFrames(page);

    await q.button("Preview settings").click();
    await test.expect(q.button("Preview settings")).toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(frame.button("Download document")).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/7963
  test("tabs to the iframe button after several keyboard round trips", async ({
    page,
    q,
  }) => {
    const frame = query(
      page.frameLocator("iframe[title='Contract document preview']"),
    );
    await test.expect(frame.button("Download document")).toBeVisible();

    await q.textbox("Document title").click();
    for (let i = 0; i < 2; i++) {
      await page.keyboard.press("Tab");
      await test.expect(q.button("Preview settings")).toBeFocused();
      await page.keyboard.press("Shift+Tab");
      await test.expect(q.textbox("Document title")).toBeFocused();
      // Portal makes its tab stops temporarily not tabbable on the next
      // animation frame after focus leaves it. No user-visible state tracks
      // that update.
      await flushFrames(page);
    }

    await page.keyboard.press("Tab");
    await test.expect(q.button("Preview settings")).toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(frame.button("Download document")).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/7974
  test("keeps the portal tab stops while focus is in the iframe", async ({
    page,
    q,
  }) => {
    const frame = query(
      page.frameLocator("iframe[title='Contract document preview']"),
    );
    await test.expect(frame.button("Download document")).toBeVisible();

    await q.textbox("Document title").click();
    await page.keyboard.press("Tab");
    await test.expect(q.button("Preview settings")).toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(frame.button("Download document")).toBeFocused();
    // Portal would make its tab stops temporarily not tabbable on the next
    // animation frame after focus leaves it. Cross that frame before checking
    // that the tab stops remain.
    await flushFrames(page);

    await page.keyboard.press("Shift+Tab");
    await test.expect(q.button("Preview settings")).toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(frame.button("Download document")).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/7974
  test("tabs from the iframe button to the element after the portal", async ({
    page,
    q,
  }) => {
    const frame = query(
      page.frameLocator("iframe[title='Contract document preview']"),
    );
    await test.expect(frame.button("Download document")).toBeVisible();

    await q.textbox("Document title").click();
    await page.keyboard.press("Tab");
    await test.expect(q.button("Preview settings")).toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(frame.button("Download document")).toBeFocused();
    // Portal would make its tab stops temporarily not tabbable on the next
    // animation frame after focus leaves it. Cross that frame before leaving
    // the iframe.
    await flushFrames(page);

    await page.keyboard.press("Tab");
    await test.expect(q.button("Save document")).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await test.expect(frame.button("Download document")).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/7974
  test("restores the portal tab stops when clicking into the iframe", async ({
    page,
    q,
  }) => {
    const frame = query(
      page.frameLocator("iframe[title='Contract document preview']"),
    );
    await test.expect(frame.button("Download document")).toBeVisible();

    await q.button("Preview settings").click();
    await test.expect(q.button("Preview settings")).toBeFocused();
    await q.textbox("Document title").click();
    await test.expect(q.textbox("Document title")).toBeFocused();
    // Portal makes its tab stops temporarily not tabbable on the next animation
    // frame after focus leaves it. No user-visible state tracks that update.
    await flushFrames(page);

    await frame.button("Download document").click();
    await test.expect(frame.button("Download document")).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await test.expect(q.button("Preview settings")).toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(frame.button("Download document")).toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(q.button("Save document")).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/7974
  test("disables the portal tab stops when clicking out of the iframe", async ({
    page,
    q,
  }) => {
    const frame = query(
      page.frameLocator("iframe[title='Contract document preview']"),
    );
    await test.expect(frame.button("Download document")).toBeVisible();

    await q.textbox("Document title").click();
    await page.keyboard.press("Tab");
    await test.expect(q.button("Preview settings")).toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(frame.button("Download document")).toBeFocused();
    await q.textbox("Document title").click();
    await test.expect(q.textbox("Document title")).toBeFocused();

    // Focus left the portal, so its tab stops are out of the tab order like
    // after focus leaves a portal control.
    await test
      .expect(q.button("Preview settings"))
      .toHaveAttribute("tabindex", "-1");
    await test
      .expect(frame.button("Download document"))
      .toHaveAttribute("tabindex", "-1");
  });

  // Firefox ignores the programmatic focus that moves into the iframe here, so
  // this check also runs only in Chrome.
  // https://github.com/ariakit/ariakit/issues/7963
  test("moves focus into the iframe when entering a toolbar container", async ({
    page,
    q,
  }) => {
    const frame = query(page.frameLocator("iframe[title='Signature pad']"));
    await test.expect(frame.button("Clear signature")).toBeVisible();

    await q.button("Bold").click();
    await test.expect(q.button("Bold")).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await test.expect(q.group("Signature pad")).toBeFocused();
    await page.keyboard.press("Enter");
    await test.expect(frame.button("Clear signature")).toBeFocused();
  });
});
