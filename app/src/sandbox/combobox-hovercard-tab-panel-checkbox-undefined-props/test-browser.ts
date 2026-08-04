import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

// The "forwarded undefined" hovercard and checkbox tests assert that something
// does *not* happen, so there is no observable state to retry against: the
// assertion would also hold in the moment before the unwanted change lands.
// They flush frames first so the popover's auto-focus effect and the command's
// queued synthetic click have run.
//
// The "explicit" tests need no barrier for a different reason: the state they
// would catch is a steady state rather than a transient one, so a retrying
// matcher cannot pass through a window before it settles.

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7028
  test("forwarded undefined autoFocusOnShow keeps focus outside the hovercard", async ({
    page,
    q,
  }) => {
    const hovercard = q.dialog("Ariakit package");
    await q.link("@ariakit/react").hover();
    await test.expect(hovercard).toBeVisible();
    // The popover only auto focuses once it has been placed, and placement is
    // async, so wait for that with a retrying assertion instead of leaving it
    // to the fixed frame count below. `data-placing` is not public API, but it
    // mirrors the store state and is the only signal exposed to the DOM.
    await test.expect(hovercard).not.toHaveAttribute("data-placing");
    await flushFrames(page);
    await test.expect(q.button("Star")).not.toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/7028
  test("forwarded undefined focusable keeps the tab panel out of the tab order", async ({
    q,
  }) => {
    await test.expect(q.tabpanel("Links")).not.toHaveAttribute("tabindex");
  });

  // https://github.com/ariakit/ariakit/issues/7028
  test("forwarded undefined clickOnEnter keeps Enter inert on a native checkbox", async ({
    page,
    q,
  }) => {
    const checkbox = q.checkbox("Subscribe");
    await checkbox.click();
    await test.expect(checkbox).toBeFocused();
    await test.expect(checkbox).toBeChecked();
    await page.keyboard.press("Enter");
    await flushFrames(page);
    await test.expect(checkbox).toBeChecked();
  });

  // https://github.com/ariakit/ariakit/issues/7028
  test("explicit autoFocusOnShow still overrides the computed default", async ({
    q,
  }) => {
    await q.link("@ariakit/docs").hover();
    await test.expect(q.dialog("Ariakit docs")).toBeVisible();
    await test.expect(q.button("Read")).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/7028
  test("explicit focusable still overrides the computed default", async ({
    q,
  }) => {
    await q.tab("Text").click();
    await test.expect(q.tabpanel("Text")).not.toHaveAttribute("tabindex");
  });

  // https://github.com/ariakit/ariakit/issues/7028
  test("explicit clickOnEnter still overrides the computed default", async ({
    page,
    q,
  }) => {
    const checkbox = q.checkbox("Notify");
    await checkbox.click();
    await test.expect(checkbox).toBeFocused();
    await test.expect(checkbox).toBeChecked();
    await page.keyboard.press("Enter");
    await test.expect(checkbox).not.toBeChecked();
  });

  // https://github.com/ariakit/ariakit/issues/7037
  test("a composed hook preserves a later computed default", async ({
    page,
    q,
  }) => {
    const combobox = q.combobox("Direct hook");
    await combobox.click();
    await page.keyboard.type("a");
    const listbox = q.listbox();
    await test.expect(listbox).toBeVisible();
    // Placement is the observable prerequisite for the auto-focus effect.
    await test.expect(listbox).not.toHaveAttribute("data-placing");
    // Focus must stay on the combobox, so no positive state can prove that the
    // auto-focus effect has had a chance to run after placement.
    await flushFrames(page);
    await test.expect(combobox).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/7028
  test("a hook's own undefined sentinel still suppresses a later computed value", async ({
    q,
  }) => {
    const checkbox = q.checkbox("Accept terms");
    await test.expect(checkbox).toBeVisible();
    await test.expect(checkbox).not.toHaveAttribute("aria-labelledby");
  });
});
