import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/5179
  test("lets a child handle Escape before the dialog", async ({ page, q }) => {
    await q.button("Open dialog").click();
    await test.expect(q.dialog("Dialog")).toBeVisible();
    await test.expect(q.combobox("Search")).toBeFocused();
    await test.expect(q.listbox("Suggestions")).toBeVisible();

    await page.keyboard.press("Escape");

    await test.expect(q.listbox("Suggestions")).toBeHidden();
    await test.expect(q.dialog("Dialog")).toBeVisible();

    await page.keyboard.press("Escape");

    await test.expect(q.dialog("Dialog")).toBeHidden();
  });

  test("clears a stopped event before it is reused", async ({ q }) => {
    await q.button("Open dialog").click();
    const input = q.combobox("Search");
    const event = await input.evaluateHandle((element) => {
      const KeyboardEvent = element.ownerDocument.defaultView?.KeyboardEvent;
      if (!KeyboardEvent) throw new Error("KeyboardEvent is not available");
      return new KeyboardEvent("keydown", {
        key: "Escape",
        bubbles: true,
        cancelable: true,
      });
    });

    await input.evaluate(
      (element, event) => element.dispatchEvent(event),
      event,
    );

    await test.expect(q.listbox("Suggestions")).toBeHidden();
    await test.expect(q.dialog("Dialog")).toBeVisible();

    await input.evaluate((element, event) => {
      event.preventDefault();
      element.dispatchEvent(event);
    }, event);

    await test.expect(q.dialog("Dialog")).toBeVisible();
  });

  test("respects a child handler delegated to document", async ({
    page,
    q,
  }) => {
    await q.button("Show document root example").click();
    const frame = page.frameLocator('iframe[title="Document root example"]');
    const openDialog = frame.getByRole("button", { name: "Open dialog" });
    const dialog = frame.getByRole("dialog", { name: "Dialog" });
    const input = frame.getByRole("combobox", { name: "Search" });
    const listbox = frame.getByRole("listbox", { name: "Suggestions" });

    await openDialog.click();
    await test.expect(input).toBeFocused();
    await test.expect(listbox).toBeVisible();

    await input.press("Escape");

    await test.expect(listbox).toBeHidden();
    await test.expect(dialog).toBeVisible();

    await input.press("Escape");

    await test.expect(dialog).toBeHidden();
  });
});
