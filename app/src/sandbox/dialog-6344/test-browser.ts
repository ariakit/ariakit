import { withFramework } from "#app/test-utils/preview.ts";

// Reproduces https://github.com/ariakit/ariakit/issues/6344
withFramework(import.meta.dirname, async ({ test }) => {
  test("stays open when interacting with a persistent element before the dialog is focused", async ({
    page,
    q,
  }) => {
    await q.button("Open dialog").click();
    await test.expect(q.dialog("Dialog")).toBeVisible();

    // The dialog hasn't been focused yet (autoFocusOnShow={false}). Clicking
    // the persistent field must not close it. The bounded timeout guards
    // against the assertion passing before the dialog processes the hide.
    await q.textbox("Notification field").click();
    await test.expect(q.textbox("Notification field")).toBeFocused();
    await page.waitForTimeout(250);
    await test.expect(q.dialog("Dialog")).toBeVisible();

    // Other interactions with the persistent region must not close it either.
    await q.button("Dismiss notification").click();
    await page.waitForTimeout(250);
    await test.expect(q.dialog("Dialog")).toBeVisible();
  });

  test("stays open on right-clicking a persistent element before the dialog is focused", async ({
    page,
    q,
  }) => {
    await q.button("Open dialog").click();
    await test.expect(q.dialog("Dialog")).toBeVisible();

    await q.textbox("Notification field").click({ button: "right" });
    await page.waitForTimeout(250);
    await test.expect(q.dialog("Dialog")).toBeVisible();
  });

  test("keeps the documented behavior after the dialog has been focused", async ({
    page,
    q,
  }) => {
    await q.button("Open dialog").click();
    await test.expect(q.dialog("Dialog")).toBeVisible();

    // Focusing inside the dialog first is the documented, working path.
    await q.textbox("Inside field").click();
    await test.expect(q.textbox("Inside field")).toBeFocused();

    await q.textbox("Notification field").click();
    await test.expect(q.textbox("Notification field")).toBeFocused();
    await page.waitForTimeout(250);
    await test.expect(q.dialog("Dialog")).toBeVisible();
  });

  test("stays open when interacting with a persistent shadow element", async ({
    page,
    q,
  }) => {
    await q.button("Open dialog").click();
    await test.expect(q.dialog("Dialog")).toBeVisible();

    const persistentInput = q.textbox("Persistent shadow field");
    // Dispatch directly on the nested shadow element. WebKit's click
    // actionability check may otherwise treat the outer shadow host as the
    // pointer target even though the nested input is visible.
    const mouseEventInit = {
      bubbles: true,
      cancelable: true,
      composed: true,
    };
    await persistentInput.dispatchEvent("mousedown", mouseEventInit);
    await persistentInput.focus();
    await persistentInput.dispatchEvent("mouseup", mouseEventInit);
    await persistentInput.dispatchEvent("click", mouseEventInit);
    await test.expect(persistentInput).toBeFocused();
    await page.waitForTimeout(250);
    await test.expect(q.dialog("Dialog")).toBeVisible();

    await q.textbox("Inside field").click();
    const persistentButton = q.button("Persistent shadow button");
    await persistentButton.dispatchEvent("mousedown", mouseEventInit);
    await persistentButton.dispatchEvent("mouseup", mouseEventInit);
    await persistentButton.dispatchEvent("click", mouseEventInit);
    await test.expect(q.textbox("Inside field")).toBeFocused();
    await page.waitForTimeout(250);
    await test.expect(q.dialog("Dialog")).toBeVisible();
  });

  test("ignores focus events from disconnected shadow elements", async ({
    page,
    q,
  }) => {
    await q.button("Open dialog").click();
    await test.expect(q.dialog("Dialog")).toBeVisible();

    await page.getByTestId("shadow-host").evaluate((host) => {
      const input = host.shadowRoot?.querySelector<HTMLInputElement>(
        "[data-disconnected-shadow-field]",
      );
      if (!input) throw new Error("Missing disconnected shadow field");
      input.focus();
    });
    await test.expect(q.textbox("Disconnected shadow field")).toHaveCount(0);
    await page.waitForTimeout(250);
    await test.expect(q.dialog("Dialog")).toBeVisible();
  });

  test("still closes when interacting outside before the dialog is focused", async ({
    q,
  }) => {
    await q.button("Open dialog").click();
    await test.expect(q.dialog("Dialog")).toBeVisible();

    await q.textbox("Outside field").click();
    await test.expect(q.dialog("Dialog")).not.toBeVisible();
  });

  test("closes when interacting inside an unrelated shadow root", async ({
    q,
  }) => {
    await q.button("Open dialog").click();
    await test.expect(q.dialog("Dialog")).toBeVisible();

    await q.textbox("Inside field").click();
    await q.textbox("Outside shadow field").click();
    await test.expect(q.dialog("Dialog")).not.toBeVisible();
  });
});
