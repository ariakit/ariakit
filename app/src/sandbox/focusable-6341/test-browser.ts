import { withFramework } from "#app/test-utils/preview.ts";

// See https://github.com/ariakit/ariakit/issues/6341
// With JavaScript disabled, the browser only gets the server-rendered HTML, so
// these tests assert what keyboard users experience before hydration completes
// or while JavaScript is unavailable.
withFramework(import.meta.dirname, async ({ test }) => {
  test.describe("javascript disabled", () => {
    test.use({ javaScriptEnabled: false });

    test("server HTML keeps div-based focusables keyboard accessible", async ({
      q,
    }) => {
      await test
        .expect(q.text("Focusable card"))
        .toHaveAttribute("tabindex", "0");
      await test
        .expect(q.text("Tooltip anchor"))
        .toHaveAttribute("tabindex", "0");
      await test
        .expect(q.toolbar("Composite"))
        .toHaveAttribute("tabindex", "0");
    });

    test("disabled Focusable doesn't server-render an invalid disabled attribute", async ({
      q,
    }) => {
      const disabledCard = q.text("Disabled focusable card");
      await test.expect(disabledCard).toHaveAttribute("aria-disabled", "true");
      await test.expect(disabledCard).not.toHaveAttribute("disabled");
      await test.expect(disabledCard).not.toHaveAttribute("tabindex");
    });

    // The submenu button covers the MenuButton case, which renders as a div
    // when nested in another menu.
    test("div-based menu items server-render in the tab order", async ({
      q,
    }) => {
      await test.expect(q.text("Menu item")).toHaveAttribute("tabindex", "0");
      await test
        .expect(q.text("Submenu button"))
        .toHaveAttribute("tabindex", "0");
    });

    test("disabled menu item doesn't server-render a disabled attribute", async ({
      q,
    }) => {
      const disabledItem = q.text("Disabled menu item");
      await test.expect(disabledItem).toHaveAttribute("aria-disabled", "true");
      await test.expect(disabledItem).not.toHaveAttribute("disabled");
      await test.expect(disabledItem).not.toHaveAttribute("tabindex");
    });

    test("native buttons keep their server-rendered semantics", async ({
      q,
    }) => {
      await test.expect(q.button("Before")).not.toHaveAttribute("tabindex");
      await test.expect(q.button("After")).not.toHaveAttribute("tabindex");
      const disabledButton = q.button("Disabled button");
      await test.expect(disabledButton).toHaveAttribute("disabled");
      await test.expect(disabledButton).not.toHaveAttribute("tabindex");
    });

    test("tab reaches div-based focusables before hydration", async ({
      page,
      q,
    }) => {
      await q.button("Before").focus();
      await page.keyboard.press("Tab");
      await test.expect(q.text("Focusable card")).toBeFocused();
      // The disabled focusable card is skipped.
      await page.keyboard.press("Tab");
      await test.expect(q.text("Tooltip anchor")).toBeFocused();
      await page.keyboard.press("Tab");
      await test.expect(q.toolbar("Composite")).toBeFocused();
    });
  });

  test("hydrated markup matches the server-rendered attributes", async ({
    q,
  }) => {
    await test
      .expect(q.text("Focusable card"))
      .toHaveAttribute("tabindex", "0");
    const disabledCard = q.text("Disabled focusable card");
    await test.expect(disabledCard).toHaveAttribute("aria-disabled", "true");
    await test.expect(disabledCard).not.toHaveAttribute("disabled");
    await test.expect(disabledCard).not.toHaveAttribute("tabindex");
    await test
      .expect(q.text("Tooltip anchor"))
      .toHaveAttribute("tabindex", "0");
    await test.expect(q.toolbar("Composite")).toHaveAttribute("tabindex", "0");
    const disabledButton = q.button("Disabled button");
    await test.expect(disabledButton).toHaveAttribute("disabled");
    await test.expect(disabledButton).not.toHaveAttribute("tabindex");
  });
});
