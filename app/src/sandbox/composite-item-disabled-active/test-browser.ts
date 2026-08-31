import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

// The native `disabled` attribute decides whether the browser keeps DOM focus
// on the element, and the engines disagree about when they run that blur, so
// this runs in every desktop project. The native checkbox below is also a
// native form control.
withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7359
  test("keeps roving focus on the item that disables itself", async ({
    page,
    q,
  }) => {
    const reply = q.button("Roving reply");
    const markAsRead = q.button("Roving mark as read");
    const archive = q.button("Roving archive");

    await reply.click();
    await page.keyboard.press("ArrowRight");
    await test.expect(markAsRead).toBeFocused();

    await page.keyboard.press("Enter");
    // The commit that reacts to the click resolves aria-disabled and the
    // native disabled decision together, so aria-disabled gates on that commit
    // in both the broken and the fixed shapes.
    await test.expect(markAsRead).toHaveAttribute("aria-disabled", "true");
    // The blur that a native disabled attribute triggers runs on the engine's
    // own task and no state tracks it, so cross that frame before asserting
    // focus, which must not change here.
    await flushFrames(page);
    await test.expect(markAsRead).toBeFocused();
    // Focusable derives the native attribute, data-truly-disabled and the
    // pointer-events style from one `trulyDisabled` value, and Hovercard reads
    // data-truly-disabled to decide whether a tooltip may open. An item that
    // holds focus is reachable, so all three must follow together rather than
    // leaving it marked unreachable.
    await test.expect(markAsRead).not.toHaveAttribute("disabled");
    await test.expect(markAsRead).not.toHaveAttribute("data-truly-disabled");
    await test.expect(markAsRead).not.toHaveCSS("pointer-events", "none");

    await page.keyboard.press("ArrowRight");
    await test.expect(archive).toBeFocused();

    // Once the item no longer holds focus, it goes back to being skipped.
    await test.expect(markAsRead).toHaveAttribute("disabled");
    await page.keyboard.press("ArrowLeft");
    await test.expect(reply).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/7359
  test("keeps virtual focus on the item that disables itself", async ({
    page,
    q,
  }) => {
    const composite = q.toolbar("Virtual message actions");
    const markAsRead = q.button("Virtual mark as read");

    await q.button("Virtual reply").click();
    await page.keyboard.press("ArrowRight");
    await test.expect(markAsRead).toHaveAttribute("data-active-item");

    await page.keyboard.press("Enter");
    // Virtual focus never puts DOM focus on the item, so it must stay natively
    // disabled and keep being skipped.
    await test.expect(markAsRead).toHaveAttribute("disabled");
    await test.expect(markAsRead).toHaveAttribute("aria-disabled", "true");
    // The composite keeps DOM focus here, so cross the engine's blur frame
    // before asserting that nothing moved it.
    await flushFrames(page);
    await test.expect(composite).toBeFocused();

    await page.keyboard.press("ArrowRight");
    await test
      .expect(q.button("Virtual archive"))
      .toHaveAttribute("data-active-item");
  });

  // https://github.com/ariakit/ariakit/issues/7359
  test("keeps focus on a controlled active item that disables itself", async ({
    page,
    q,
  }) => {
    const markAsRead = q.button("Controlled mark as read");

    await q.button("Controlled reply").click();
    await page.keyboard.press("ArrowRight");
    await test.expect(markAsRead).toBeFocused();

    await page.keyboard.press("Enter");
    await test.expect(markAsRead).toHaveAttribute("aria-disabled", "true");
    // Same engine blur frame as the roving test above, crossed because focus
    // here is state that must not change.
    await flushFrames(page);
    await test.expect(markAsRead).toBeFocused();
    await test.expect(markAsRead).toHaveAttribute("data-active-item");

    await page.keyboard.press("ArrowRight");
    await test.expect(q.button("Controlled archive")).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/7359
  test("keeps focus on a native control that disables itself", async ({
    page,
    q,
  }) => {
    const markAsRead = q.checkbox("Native mark as read");

    await q.button("Native reply").click();
    await page.keyboard.press("ArrowRight");
    await test.expect(markAsRead).toBeFocused();

    await page.keyboard.press("Space");
    await test.expect(markAsRead).toBeChecked();
    await test.expect(markAsRead).toHaveAttribute("aria-disabled", "true");
    // Same engine blur frame as the roving test above, crossed because focus
    // here is state that must not change. A native checkbox is disabled the
    // same way a button is.
    await flushFrames(page);
    await test.expect(markAsRead).toBeFocused();

    // The item stays focusable, but it must not activate anymore. The native
    // checkbox toggles synchronously with the key event, so no later state
    // could still flip it.
    await page.keyboard.press("Space");
    await test.expect(markAsRead).toBeChecked();

    await page.keyboard.press("ArrowRight");
    await test.expect(q.button("Native archive")).toBeFocused();
  });

  // An item that is not natively focusable keeps its focus through the item's
  // `tabindex` rather than through the absence of a native `disabled`
  // attribute, so it loses focus by a different mechanism.
  // https://github.com/ariakit/ariakit/issues/7359
  test("keeps roving focus on a non-native item that disables itself", async ({
    page,
    q,
  }) => {
    const markAsRead = q.button("Non-native mark as read");
    const archive = q.button("Non-native archive");

    await q.button("Non-native reply").click();
    await page.keyboard.press("ArrowRight");
    await test.expect(markAsRead).toBeFocused();

    await page.keyboard.press("Enter");
    await test.expect(markAsRead).toHaveAttribute("aria-disabled", "true");
    // Same engine blur frame as the roving test above, crossed because focus
    // here is state that must not change.
    await flushFrames(page);
    await test.expect(markAsRead).toBeFocused();
    await test.expect(markAsRead).toHaveAttribute("tabindex", "0");

    await page.keyboard.press("ArrowRight");
    await test.expect(archive).toBeFocused();

    // Once the item no longer holds focus, it drops out of the focus order.
    await test.expect(markAsRead).not.toHaveAttribute("tabindex");
  });

  // https://github.com/ariakit/ariakit/issues/7359
  test("honors an explicit accessibleWhenDisabled opt out", async ({
    page,
    q,
  }) => {
    const reply = q.button("Opt out reply");
    const markAsRead = q.button("Opt out mark as read");

    await reply.click();
    await page.keyboard.press("ArrowRight");
    await test.expect(markAsRead).toBeFocused();

    await page.keyboard.press("Enter");
    await test.expect(markAsRead).toHaveAttribute("disabled");
    await test.expect(markAsRead).not.toBeFocused();

    // The opt out accepts the focus loss, so the composite must stay reachable
    // while activeId still points at the disabled item.
    await test.expect(markAsRead).toHaveAttribute("data-active-item");
    await q.button("Before opt out").click();
    await page.keyboard.press("Tab");
    await test.expect(reply).toBeFocused();
  });

  // Guards the fix above against regressing the composite entry behavior at the
  // Composite layer. https://github.com/ariakit/ariakit/issues/3232 also covers
  // this through Toolbar in app/src/sandbox/toolbar-keyboard-navigation.
  test("skips an active item that is disabled before it receives focus", async ({
    page,
    q,
  }) => {
    await q.button("Before initially disabled").click();
    await page.keyboard.press("Tab");
    await test.expect(q.button("Initially disabled archive")).toBeFocused();
    await test
      .expect(q.button("Initially disabled reply"))
      .toHaveAttribute("disabled");

    await page.keyboard.press("Tab");
    await test.expect(q.button("After initially disabled")).toBeFocused();
  });
});
