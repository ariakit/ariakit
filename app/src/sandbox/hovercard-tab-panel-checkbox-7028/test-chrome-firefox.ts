import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

// The hovercard and checkbox tests assert that something does *not* happen, so
// there is no observable state to retry against: the assertion would also hold
// in the moment before the unwanted change lands. Flush frames first so the
// popover's auto-focus effect and the command's queued synthetic click have
// run.

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
});
