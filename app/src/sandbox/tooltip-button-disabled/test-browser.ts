import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7115
  test("shows the tooltip on hover when the anchor renders the disabled button", async ({
    q,
  }) => {
    await q.button("Delete file").hover();
    await test
      .expect(q.tooltip("You need permission to delete files"))
      .toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/7115
  test("shows the tooltip on hover when the disabled button renders the anchor", async ({
    q,
  }) => {
    await q.button("Share file").hover();
    await test
      .expect(q.tooltip("You need permission to share files"))
      .toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/7115
  test("shows the tooltip on hover when the anchor itself is the disabled one", async ({
    q,
  }) => {
    await q.button("Export file").hover();
    await test
      .expect(q.tooltip("You need permission to export files"))
      .toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/7115
  test("shows the tooltip on keyboard focus in both composition orders", async ({
    q,
  }) => {
    // Ariakit's modality starts as keyboard until a pointer gesture drops it,
    // and nothing before this point uses the pointer, so these programmatic
    // focus calls are keyboard focus. The `data-focus-visible` assertions are
    // what keep that precondition honest. The happy-dom duplicate presses Tab,
    // which Safari only does with the macOS keyboard navigation setting on.
    const anchorFirst = q.button("Delete file");
    await anchorFirst.focus();
    await test
      .expect(anchorFirst)
      .toHaveAttribute("data-focus-visible", "true");
    await test
      .expect(q.tooltip("You need permission to delete files"))
      .toBeVisible();

    const buttonFirst = q.button("Share file");
    await buttonFirst.focus();
    await test
      .expect(buttonFirst)
      .toHaveAttribute("data-focus-visible", "true");
    await test
      .expect(q.tooltip("You need permission to share files"))
      .toBeVisible();
  });

  test("does not show the tooltip on hover when the consumer opts out for disabled anchors", async ({
    page,
    q,
  }) => {
    await q.button("Archive file").hover();
    // The tooltip would open from a store update rendered on a later frame, so
    // cross those frames to give the assertion below a chance to fail.
    await flushFrames(page);
    await test
      .expect(q.tooltip("You need permission to archive files"))
      .not.toBeVisible();
  });

  test("still shows the tooltip on keyboard focus when hover is opted out", async ({
    q,
  }) => {
    // The same anchor and tooltip as the test above, so that one fails instead
    // of passing vacuously if this tooltip ever stops opening at all.
    const anchor = q.button("Archive file");
    await anchor.focus();
    await test.expect(anchor).toHaveAttribute("data-focus-visible", "true");
    await test
      .expect(q.tooltip("You need permission to archive files"))
      .toBeVisible();
  });

  test("lets a callback decide whether a disabled anchor shows on hover", async ({
    page,
    q,
  }) => {
    // The callback returns false for this anchor's reason, so a callback that
    // is ignored, coerced to a truthy object, or handed the wrong target would
    // show the tooltip here.
    await q.button("Restore file").hover();
    // The tooltip would open from a store update rendered on a later frame, so
    // cross those frames to give the assertion below a chance to fail.
    await flushFrames(page);
    await test
      .expect(q.tooltip("You need permission to restore files"))
      .not.toBeVisible();
  });

  test("still shows the tooltip on keyboard focus when a callback declines hover", async ({
    q,
  }) => {
    // The same anchor and tooltip as the test above, so that one fails instead
    // of passing vacuously if this tooltip ever stops opening at all.
    const anchor = q.button("Restore file");
    await anchor.focus();
    await test.expect(anchor).toHaveAttribute("data-focus-visible", "true");
    await test
      .expect(q.tooltip("You need permission to restore files"))
      .toBeVisible();
  });

  test("shows the tooltip on hover when the rendered element declares itself disabled", async ({
    q,
  }) => {
    // Ariakit resolved no disabled state here, so the anchor still shows its
    // tooltip on hover, the way it did before the hover decision started
    // reading the element.
    await q.button("Publish file").hover();
    await test.expect(q.tooltip("Publishing needs a reviewer")).toBeVisible();
  });

  test("shows the tooltip on keyboard focus when the rendered element declares itself disabled", async ({
    q,
  }) => {
    // The pointer and keyboard halves have to agree. Revealing on focus while
    // withholding on hover is what the truly disabled rule exists to prevent,
    // in reverse.
    const anchor = q.button("Publish file");
    await anchor.focus();
    await test.expect(anchor).toHaveAttribute("data-focus-visible", "true");
    await test.expect(q.tooltip("Publishing needs a reviewer")).toBeVisible();
  });

  test("keeps truly disabled anchors out of pointer reach", async ({ q }) => {
    // Focusable applies `pointer-events: none` to truly disabled elements, so no
    // mouse move can reach these anchors and the shield is the behavior here.
    // The hover decision is covered by the two tests below, where it's lifted.
    await test
      .expect(q.button("Rename file"))
      .toHaveCSS("pointer-events", "none");
    await test
      .expect(q.button("Move file"))
      .toHaveCSS("pointer-events", "none");
  });

  test("does not show the tooltip on hover for a truly disabled anchor that keeps pointer events", async ({
    page,
    q,
  }) => {
    const anchor = q.button("Duplicate file");
    // Restoring pointer events is what makes this the hover decision's own
    // test: the mouse move reaches the anchor and only the resolved disabled
    // state can keep the tooltip closed.
    await test.expect(anchor).toHaveCSS("pointer-events", "auto");
    await anchor.hover();
    // The tooltip would open from a store update rendered on a later frame, so
    // cross those frames to give the assertion below a chance to fail.
    await flushFrames(page);
    await test
      .expect(q.tooltip("Duplicating is unavailable"))
      .not.toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/7116
  test("does not show the tooltip on hover when the truly disabled state is below the anchor", async ({
    page,
    q,
  }) => {
    const anchor = q.button("Print file");
    await test.expect(anchor).toHaveCSS("pointer-events", "auto");
    await anchor.hover();
    // The tooltip would open from a store update rendered on a later frame, so
    // cross those frames to give the assertion below a chance to fail.
    await flushFrames(page);
    await test.expect(q.tooltip("Printing is unavailable")).not.toBeVisible();
  });

  test("opens a delayed tooltip on hover", async ({ q }) => {
    const anchor = q.button("Preview file");
    // Scroll first so the hover is the last pointer activity. Ariakit resets
    // its hover intent on `scroll`, and a smooth scroll triggered by hovering
    // can land after the mouse move and cancel the pending show.
    await anchor.scrollIntoViewIfNeeded();
    await anchor.hover();
    // The provider delays the show by 150ms, which the retrying assertion below
    // waits out. This is the control for the test below, which uses the same
    // delay.
    await test.expect(q.tooltip("Opens a read-only preview")).toBeVisible();
  });

  test("does not open a delayed tooltip when the anchor turns truly disabled while it is pending", async ({
    page,
    q,
  }) => {
    const anchor = q.button("Sync file");
    // Same scroll-before-hover ordering as the control above, so the pending
    // show this test is about is actually scheduled.
    await anchor.scrollIntoViewIfNeeded();
    await anchor.hover();
    // Hovering revoked the access that kept this anchor explainable, so it is
    // truly disabled by now and dropped out of the tab order.
    await test.expect(anchor).not.toHaveAttribute("tabindex");
    // Same 150ms show timeout as the control above, and nothing observable
    // tracks it, so cross it before asserting the tooltip stayed closed.
    await page.waitForTimeout(250);
    await test.expect(q.tooltip("Syncing needs access")).not.toBeVisible();
  });

  test("shows the tooltip on hover when the rendered button is disabled with focusable false", async ({
    q,
  }) => {
    // `focusable={false}` makes the button's disabled props inoperative, so
    // the anchor keeps the element keyboard reachable and reveals on focus.
    // Hover has to agree, or the tooltip becomes keyboard-only.
    await q.button("Compress file").hover();
    await test
      .expect(q.tooltip("Compression runs in the background"))
      .toBeVisible();
  });

  test("shows the tooltip on keyboard focus when the rendered button is disabled with focusable false", async ({
    q,
  }) => {
    // The keyboard half of the parity the test above locks in.
    const anchor = q.button("Compress file");
    await anchor.focus();
    await test.expect(anchor).toHaveAttribute("data-focus-visible", "true");
    await test
      .expect(q.tooltip("Compression runs in the background"))
      .toBeVisible();
  });

  test("does not show the tooltip on hover when the anchor is disabled with focusable false", async ({
    page,
    q,
  }) => {
    // With `focusable={false}` the anchor has no tab stop and no focus reveal,
    // so revealing on hover would reach pointer users alone. No pointer-events
    // shield applies here, so the hover decision itself is what this asserts.
    const anchor = q.text("Encrypt file");
    await test.expect(anchor).not.toHaveAttribute("tabindex");
    await anchor.hover();
    // The tooltip would open from a store update rendered on a later frame, so
    // cross those frames to give the assertion below a chance to fail.
    await flushFrames(page);
    await test.expect(q.tooltip("Encryption is unavailable")).not.toBeVisible();
  });

  test("does not open a delayed tooltip when the anchor loses focusable while it is pending", async ({
    page,
    q,
  }) => {
    const anchor = q.text("Upload file");
    // Same scroll-before-hover ordering as the delayed tests above, so the
    // pending show this test is about is actually scheduled.
    await anchor.scrollIntoViewIfNeeded();
    await anchor.hover();
    // Hovering locked the upload, so the anchor is now disabled with
    // `focusable={false}` and out of the tab order.
    await test.expect(anchor).not.toHaveAttribute("tabindex");
    // Same 150ms show timeout as the "Preview file" control above, and nothing
    // observable tracks it, so cross it before asserting the tooltip stayed
    // closed.
    await page.waitForTimeout(250);
    await test
      .expect(q.tooltip("Uploading needs a connection"))
      .not.toBeVisible();
  });

  test("shows the tooltip on hover when the rendered element carries the attribute with a false value", async ({
    q,
  }) => {
    // Only Ariakit's stamped value counts, so a render component emitting
    // data-truly-disabled="false" for its own styling keeps its hover behavior.
    await q.button("Tag file").hover();
    await test.expect(q.tooltip("Tags help you find files")).toBeVisible();
  });

  test("keeps the disabled semantics on accessible disabled anchors", async ({
    q,
  }) => {
    await test
      .expect(q.button("Delete file"))
      .toHaveAttribute("aria-disabled", "true");
    await test
      .expect(q.button("Share file"))
      .toHaveAttribute("aria-disabled", "true");
    await test
      .expect(q.button("Export file"))
      .toHaveAttribute("aria-disabled", "true");
  });

  test("does not put an accessible disabled anchor in the pressed state", async ({
    page,
    q,
  }) => {
    // Activation stays suppressed here, so Space must not make the anchor look
    // pressed either. Only the button-first order is covered: the anchor-first
    // one renders a native button, where a trusted Space is a native click and
    // never reaches the pressed state. The happy-dom duplicate, whose events
    // are untrusted, covers both orders.
    const buttonFirst = q.button("Share file");
    await buttonFirst.focus();
    // Space goes to the active element, so an anchor that stopped being
    // focusable would leave the assertion passing against the body.
    await test.expect(buttonFirst).toBeFocused();
    await page.keyboard.down("Space");
    await test.expect(buttonFirst).not.toHaveAttribute("data-active");
    await page.keyboard.up("Space");
  });

  test("does not activate accessible disabled anchors", async ({ page, q }) => {
    // These anchors still receive pointer events, but Playwright's
    // actionability check treats `aria-disabled` as not enabled, so the click
    // has to be forced to reproduce what a real pointer user can do.
    await q.button("Delete file").click({ force: true });
    await q.button("Share file").click({ force: true });
    await q.button("Export file").click({ force: true });
    await q.button("Archive file").click({ force: true });
    await q.button("Restore file").click({ force: true });
    // Nothing changes when the clicks are correctly suppressed, so cross the
    // frames a state update would have landed on before asserting the count.
    await flushFrames(page);
    await test.expect(q.text("Activations: 0")).toBeVisible();

    // The same handler on an enabled button, so the assertion above fails if
    // the counter ever stops counting rather than if the clicks are suppressed.
    await q.button("Download file").click();
    await test.expect(q.text("Activations: 1")).toBeVisible();
  });
});
