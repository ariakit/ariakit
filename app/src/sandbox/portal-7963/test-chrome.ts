import { withFramework } from "#app/test-utils/preview.ts";

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
    // Leaving the portal makes its tabbable elements, including the ones in the
    // iframe, temporarily not tabbable.
    await q.textbox("Document title").click();
    await test.expect(q.textbox("Document title")).toBeFocused();
    await test
      .expect(frame.button("Download document"))
      .toHaveAttribute("tabindex", "-1");

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
      await test
        .expect(frame.button("Download document"))
        .toHaveAttribute("tabindex", "-1");
    }

    await page.keyboard.press("Tab");
    await test.expect(q.button("Preview settings")).toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(frame.button("Download document")).toBeFocused();
  });
});
