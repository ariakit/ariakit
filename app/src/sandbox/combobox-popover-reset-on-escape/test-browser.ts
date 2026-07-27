import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

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

  test("runs reset once for one accepted Escape", async ({ page, q }) => {
    const select = q.combobox("Counted");
    const counts = q.status("Counted counts");
    await select.click();
    await test.expect(counts).toHaveText("reset:0 close:0 events:");

    await page.keyboard.press("Escape");

    await test.expect(q.listbox()).toBeHidden();
    await test.expect(counts).toHaveText("reset:1 close:1 events:close,reset");
  });

  test("runs reset once for a controlled close request", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Controlled counted");
    const counts = q.status("Controlled counted counts");
    await select.click();
    await page.keyboard.press("ArrowDown");
    await test.expect(select).toHaveText("Banana");

    await page.keyboard.press("Escape");

    await test.expect(q.listbox()).toBeVisible();
    await test.expect(select).toHaveText("Apple");
    await test.expect(counts).toHaveText(/^reset:1\b/);
  });

  test("doesn't reset when onClose prevents the close", async ({ page, q }) => {
    const select = q.combobox("Vetoed");
    const counts = q.status("Vetoed counts");
    await select.click();
    await page.keyboard.press("ArrowDown");
    await test.expect(select).toHaveText("Banana");

    await page.keyboard.press("Escape");

    await test.expect(q.listbox()).toBeVisible();
    await test.expect(select).toHaveText("Banana");
    await test.expect(counts).toHaveText("reset:0 close:2 events:close,close");
  });

  test("preserves the original baseline after a prevented close", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Vetoed once");
    await select.click();
    await page.keyboard.press("ArrowDown");
    await test.expect(select).toHaveText("Banana");

    await page.keyboard.press("Escape");
    await test.expect(q.listbox()).toBeVisible();
    await test.expect(select).toHaveText("Banana");
    await test.expect(q.status("Vetoed once ready")).toHaveText("ready");

    await page.keyboard.press("Escape");
    await test.expect(q.listbox()).toBeHidden();
    await test.expect(select).toHaveText("Apple");
  });

  test("keeps tracking the baseline after a close is prevented before moving", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Vetoed before move");
    await select.click();
    await page.keyboard.press("Escape");
    await test.expect(q.listbox()).toBeVisible();
    await test.expect(q.status("Vetoed before move ready")).toHaveText("ready");
    await q.button("Set selection after veto").click();
    await test.expect(select).toHaveText("Banana");
    await select.focus();
    await page.keyboard.press("End");
    await test.expect(select).toHaveText("Grape");

    await page.keyboard.press("Escape");

    await test.expect(q.listbox()).toBeHidden();
    await test.expect(select).toHaveText("Banana");
  });

  test("keeps tracking a synchronous selection update from a vetoing onClose", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Vetoed with selection");
    await select.click();
    await page.keyboard.press("Escape");
    await test.expect(q.listbox()).toBeVisible();
    await test.expect(select).toHaveText("Banana");
    await test
      .expect(q.status("Vetoed with selection ready"))
      .toHaveText("ready");
    await select.focus();
    await page.keyboard.press("End");
    await test.expect(select).toHaveText("Grape");

    await page.keyboard.press("Escape");

    await test.expect(q.listbox()).toBeHidden();
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
    // WebKit doesn't move focus to a button on click.
    await q.button("Consumes Escape and closes").focus();

    await page.keyboard.press("Escape");

    await test.expect(q.listbox()).toBeHidden();
    await test.expect(select).toHaveText("Banana");
  });

  // https://github.com/ariakit/ariakit/issues/5695
  test("resets after an unprevented controlled close request", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Controlled open");
    await select.click();
    await page.keyboard.press("ArrowDown");
    await test.expect(select).toHaveText("Banana");

    await page.keyboard.press("Escape");

    await test.expect(q.listbox()).toBeVisible();
    await test.expect(select).toHaveText("Apple");
  });

  // https://github.com/ariakit/ariakit/pull/6832#discussion_r3650305278
  test("doesn't render the popover when the selected value changes", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Render counted");
    const renderCount = q.status("Render counted popover renders");
    await select.click();
    // Opening can finish one-time focus and positioning work on the next
    // frames. Sample only after those unrelated renders have settled.
    await flushFrames(page);
    const countBeforeChange = await renderCount.textContent();

    await q.button("Set render counted selection").click();

    await test.expect(select).toHaveText("Banana");
    await test.expect(renderCount).toHaveText(countBeforeChange ?? "");
  });

  // https://github.com/ariakit/ariakit/pull/6832#discussion_r3650306657
  test("doesn't steal focus after focus leaves the popover", async ({ q }) => {
    const select = q.combobox("Render counted");
    const target = q.button("External focus target");
    await select.click();
    // Keep both focus changes in the same task so the queued restoration runs
    // only after focus has already moved out of the popover.
    await target.evaluate((element) => {
      const popover = document.querySelector<HTMLElement>(
        '[role="listbox"]:not([hidden])',
      );
      popover?.focus();
      element.focus();
    });

    await test.expect(target).toBeFocused();
  });
});
