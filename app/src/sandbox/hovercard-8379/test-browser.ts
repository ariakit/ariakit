import { withFramework } from "#app/test-utils/preview.ts";

// The default hide timeout. Nothing shows a pending hide.
const hideTimeout = 500;

withFramework(import.meta.dirname, async ({ test, query }) => {
  // https://github.com/ariakit/ariakit/issues/8379
  test("keep the hovercard open while the mouse moves in a frame inside it", async ({
    page,
    q,
  }) => {
    const card = q.dialog("Button");
    const preview = query(page.frameLocator("iframe[title='Button preview']"));
    await q.link("Button").hover();
    await test.expect(card).toBeVisible();
    // A real mouse crosses the hovercard before it enters the frame.
    await query(card).heading("Button").hover();
    await preview.button("Preview button").hover();
    await preview.text("Section 1", { exact: true }).hover();
    // A mouse move outside the hovercard hides it after the hide timeout, which
    // nothing shows while it's pending.
    await page.waitForTimeout(hideTimeout);
    await test.expect(card).toHaveAttribute("data-open");
  });

  // https://github.com/ariakit/ariakit/issues/8379
  test("keep the hovercard open while the mouse moves in a nested frame inside it", async ({
    page,
    q,
  }) => {
    const card = q.dialog("Button");
    const preview = query(page.frameLocator("iframe[title='Button preview']"));
    const nested = query(
      page
        .frameLocator("iframe[title='Button preview']")
        .frameLocator("iframe[title='Nested preview']"),
    );
    await q.link("Button").hover();
    await test.expect(card).toBeVisible();
    // Ariakit ignores mouse moves after a scroll until the mouse moves in a
    // document that it tracks, and the nested frame loads too late for that. So
    // nothing scrolls after the mouse moves in the outer frame.
    await nested.button("Nested button").scrollIntoViewIfNeeded();
    await query(card).heading("Button").hover();
    await preview.button("Preview button").hover();
    await nested.button("Nested button").hover();
    await nested.button("Nested button").hover({ position: { x: 4, y: 4 } });
    // A mouse move outside the hovercard hides it after the hide timeout, which
    // nothing shows while it's pending.
    await page.waitForTimeout(hideTimeout);
    await test.expect(card).toHaveAttribute("data-open");
  });

  // https://github.com/ariakit/ariakit/issues/8379
  test("hide the hovercard when the mouse moves in a frame outside it", async ({
    page,
    q,
  }) => {
    const card = q.dialog("Button");
    const outside = query(page.frameLocator("iframe[title='Outside preview']"));
    await q.link("Button").hover();
    await test.expect(card).toBeVisible();
    await query(card).heading("Button").hover();
    await outside.button("Outside button").hover();
    await test.expect(card).toBeHidden();
  });
});
