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
