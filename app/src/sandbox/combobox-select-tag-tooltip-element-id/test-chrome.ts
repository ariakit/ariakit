import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("updates combobox relationships when the input id changes", async ({
    q,
  }) => {
    const section = query(q.region("Combobox"));
    const label = section.text("Combobox label");
    const combobox = section.combobox("Combobox label");
    const cancel = section.button("Clear input");

    await test.expect(label).toHaveAttribute("for", "combobox-before");
    await test
      .expect(cancel)
      .toHaveAttribute("aria-controls", "combobox-before");

    await section.button("Change combobox id").click();

    await test.expect(label).toHaveAttribute("for", "combobox-after");
    await test
      .expect(cancel)
      .toHaveAttribute("aria-controls", "combobox-after");
    await test.expect(combobox).toHaveAttribute("id", "combobox-after");
  });

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
    const list = section.listbox("Tag label");

    await test.expect(label).toHaveAttribute("for", "tag-input-before");
    await test
      .expect(list)
      .toHaveAttribute("aria-labelledby", "tag-label-before");

    await section.button("Change tag input id").click();

    await test.expect(label).toHaveAttribute("for", "tag-input-after");
    await test.expect(input).toHaveAttribute("id", "tag-input-after");

    await section.button("Change tag label id").click();

    await test
      .expect(list)
      .toHaveAttribute("aria-labelledby", "tag-label-after");
  });

  test("updates the tooltip anchor when the content id changes", async ({
    q,
  }) => {
    const section = query(q.region("Tooltip"));
    const anchor = section.button("Tooltip label");

    await test
      .expect(anchor)
      .toHaveAttribute("aria-labelledby", "tooltip-before");

    await section.button("Change tooltip id").click();

    await test
      .expect(anchor)
      .toHaveAttribute("aria-labelledby", "tooltip-after");
  });
});
