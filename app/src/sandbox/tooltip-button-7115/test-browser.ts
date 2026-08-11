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

  test("keeps truly disabled anchors out of pointer reach", async ({ q }) => {
    // Focusable applies `pointer-events: none` to truly disabled elements, so no
    // mouse move can reach these anchors and the shield is the behavior here.
    // The hover decision is covered by the "Duplicate file" test, where it's
    // lifted.
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
