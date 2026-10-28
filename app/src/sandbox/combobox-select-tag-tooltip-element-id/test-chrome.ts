import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("updates select relationships when the label id changes", async ({
    q,
  }) => {
    const section = query(q.region("Select"));
    const select = section.combobox("Select label");
    const list = section.listbox("Select label");

    await test
      .expect(select)
      .toHaveAttribute("aria-labelledby", "select-label-before");
    await test
      .expect(list)
      .toHaveAttribute("aria-labelledby", "select-label-before");

    await section.button("Change select label id").click();

    await test
      .expect(select)
      .toHaveAttribute("aria-labelledby", "select-label-after");
    await test
      .expect(list)
      .toHaveAttribute("aria-labelledby", "select-label-after");
  });

  test("updates tag relationships when element ids change", async ({ q }) => {
    const section = query(q.region("Tag"));
    const label = section.text("Tag label");
    const input = section.textbox("Tag label");
    // Playwright filters an initially empty display: contents list from default
    // role queries.
    // https://github.com/ariakit/ariakit/issues/7164
    const list = section.listbox("Tag label", { includeHidden: true });
    // The label names the control too, which groups the tag list and the input.
    const control = section.group("Tag label");

    await test.expect(label).toHaveAttribute("for", "tag-input-before");
    await test
      .expect(list)
      .toHaveAttribute("aria-labelledby", "tag-label-before");
    await test
      .expect(control)
      .toHaveAttribute("aria-labelledby", "tag-label-before");

    await section.button("Change tag input id").click();

    await test.expect(label).toHaveAttribute("for", "tag-input-after");
    await test.expect(input).toHaveAttribute("id", "tag-input-after");

    await section.button("Change tag label id").click();

    await test
      .expect(list)
      .toHaveAttribute("aria-labelledby", "tag-label-after");
    await test
      .expect(control)
      .toHaveAttribute("aria-labelledby", "tag-label-after");
  });
});
