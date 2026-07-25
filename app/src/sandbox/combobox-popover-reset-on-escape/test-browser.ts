import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/pull/6832#discussion_r3649285785
  for (const label of ["Mounted", "Unmounted"]) {
    test(`restores the value from before the popover was shown (${label})`, async ({
      page,
      q,
    }) => {
      const select = q.combobox(label);
      await select.click();
      await page.keyboard.press("ArrowDown");

      await test.expect(select).toHaveText("Banana");

      await page.keyboard.press("Escape");

      await test.expect(select).toHaveText("Apple");
    });
  }

  test("honors a resetOnEscape callback", async ({ page, q }) => {
    const select = q.combobox("Callback");
    await select.click();
    await page.keyboard.press("ArrowDown");

    await test.expect(select).toHaveText("Banana");

    await page.keyboard.press("Escape");

    await test.expect(select).toHaveText("Banana");
  });

  // https://github.com/ariakit/ariakit/pull/6832#discussion_r3650306380
  test("keeps the value when a descendant consumes Escape", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Descendant");
    await select.click();
    await page.keyboard.press("ArrowDown");

    await test.expect(select).toHaveText("Banana");

    // Focused rather than clicked because WebKit doesn't move focus to a
    // button on click, which would send the escape key somewhere else.
    await q.button("Handles escape").focus();
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

    await q.button("Stops propagation").focus();
    await page.keyboard.press("Escape");

    // The popover staying open is what proves the reset can't have committed,
    // so it is asserted before the value.
    await test.expect(q.listbox()).toBeVisible();
    await test.expect(select).toHaveText("Banana");
  });

  test("still restores when hideOnEscape prevents the default", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Prevented");
    await select.click();
    await page.keyboard.press("ArrowDown");

    await test.expect(select).toHaveText("Banana");

    await page.keyboard.press("Escape");

    await test.expect(q.listbox()).toBeHidden();
    await test.expect(select).toHaveText("Apple");
  });
});
