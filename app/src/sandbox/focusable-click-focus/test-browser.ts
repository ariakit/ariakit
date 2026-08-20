import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("button receives focus on click", async ({ q }) => {
    const button = q.button("Button");
    await button.click();
    await test.expect(button).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/7099
  // Nothing here is a composite, so this pins the modality rule on a plain
  // Focusable rather than on composite navigation.
  test("shows focus-visible on a modified navigation key", async ({
    page,
    q,
  }) => {
    const button = q.button("Button");

    await button.click();
    await test.expect(button).toBeFocused();
    // data-focus-visible is applied from a queued callback a frame later, so
    // cross those frames before asserting it never arrives.
    await flushFrames(page);
    await test.expect(button).not.toHaveAttribute("data-focus-visible");

    await page.keyboard.press("Alt+ArrowDown");

    await test.expect(button).toHaveAttribute("data-focus-visible", "true");
  });

  // https://github.com/ariakit/ariakit/issues/7215
  // happy-dom defines `nodeType` on the form's prototype, so only real browsers
  // reproduce the named-property override this interaction exercises.
  test("uses pointer focus on a form that names a nodeType field", async ({
    page,
    q,
  }) => {
    const addEditor = q.button("Add node editor");
    await addEditor.focus();
    await addEditor.press("Enter");

    const form = q.form("Node editor");
    await test.expect(form).toBeVisible();
    await form.click({ position: { x: 4, y: 4 } });
    await test.expect(form).toBeFocused();

    // data-focus-visible is applied from a queued callback a frame later, so
    // cross those frames before asserting it never arrives.
    await flushFrames(page);
    await test.expect(q.text("Pointer focus")).toBeVisible();
    await test.expect(q.text("Keyboard focus")).not.toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/7215
  test("preserves the nodeType form data key", async ({ q }) => {
    await q.button("Add node editor").click();
    await q.textbox("Node type").fill("element");
    await q.button("Save node").click();
    await test
      .expect(q.text('Submitted data: {"nodeType":"element"}'))
      .toBeVisible();
  });

  test("checkbox receives focus on click", async ({ q }) => {
    const checkbox = q.checkbox("Checkbox");
    await checkbox.click();
    await test.expect(checkbox).toBeFocused();
  });

  test("radio receives focus on click", async ({ q }) => {
    const radio = q.radio("Radio A");
    await radio.click();
    await test.expect(radio).toBeFocused();
  });

  test("checkbox receives focus on label click", async ({ q }) => {
    const checkbox = q.checkbox("Checkbox");
    await q.text("Checkbox").click();
    await test.expect(checkbox).toBeFocused();
  });

  test("radio receives focus on label click", async ({ q }) => {
    const radio = q.radio("Radio A");
    await q.text("Radio A").click();
    await test.expect(radio).toBeFocused();
  });

  test("submit input receives focus on click", async ({ q }) => {
    const submit = q.button("Submit");
    await submit.click();
    await test.expect(submit).toBeFocused();
  });

  test("wrapped checkbox receives focus on click", async ({ q }) => {
    const checkbox = q.checkbox("Wrapped");
    await checkbox.click();
    await test.expect(checkbox).toBeFocused();
  });

  test("wrapped checkbox receives focus on label click", async ({ q }) => {
    const checkbox = q.checkbox("Wrapped");
    await q.text("Wrapped").click();
    await test.expect(checkbox).toBeFocused();
  });
});
