import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
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
});
