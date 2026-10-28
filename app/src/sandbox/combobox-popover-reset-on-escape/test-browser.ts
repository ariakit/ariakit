import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/pull/6832#discussion_r3650306380
  test("keeps the value when a descendant consumes Escape", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Descendant");
    await select.click();
    await page.keyboard.press("ArrowDown");

    await test.expect(select).toHaveText("Banana");

    const button = q.button("Handles escape");
    await button.click();
    await test.expect(button).toBeFocused();
    await page.keyboard.press("Escape");

    // The popover staying open is what proves the reset can't have committed,
    // so it is asserted before the value.
    await test.expect(q.listbox()).toBeVisible();
    await test.expect(select).toHaveText("Banana");
  });

  // https://github.com/ariakit/ariakit/pull/6832#discussion_r3650306380
  test("keeps the value when a descendant stops the Escape propagation", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Propagation");
    await select.click();
    await page.keyboard.press("ArrowDown");

    await test.expect(select).toHaveText("Banana");

    const button = q.button("Stops propagation");
    await button.click();
    await test.expect(button).toBeFocused();
    await page.keyboard.press("Escape");

    // The popover staying open is what proves the reset can't have committed,
    // so it is asserted before the value.
    await test.expect(q.listbox()).toBeVisible();
    await test.expect(select).toHaveText("Banana");
  });

  test("doesn't reset for a different close from a consumed Escape", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Descendant close");
    await select.click();
    await page.keyboard.press("ArrowDown");
    await test.expect(select).toHaveText("Banana");
    const button = q.button("Consumes Escape and closes");
    await button.click();
    await test.expect(button).toBeFocused();

    await page.keyboard.press("Escape");

    await test.expect(q.listbox()).toBeHidden();
    await test.expect(select).toHaveText("Banana");
  });
});
