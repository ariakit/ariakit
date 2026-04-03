import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("dialog with aria-label has no aria-labelledby", async ({ q }) => {
    await q.button("Open dialog").click();
    const dialog = q.dialog("Custom dialog label");
    await test.expect(dialog).toBeVisible();
    await test
      .expect(dialog)
      .toHaveAttribute("aria-label", "Custom dialog label");
    await test.expect(dialog).not.toHaveAttribute("aria-labelledby");
  });

  test("tab panel with aria-label has no aria-labelledby", async ({ q }) => {
    const panel = q.tabpanel("Custom panel label");
    await test.expect(panel).toBeVisible();
    await test
      .expect(panel)
      .toHaveAttribute("aria-label", "Custom panel label");
    await test.expect(panel).not.toHaveAttribute("aria-labelledby");
  });

  test("select with aria-label has no aria-labelledby", async ({ q }) => {
    const select = q.combobox("Custom select label");
    await test.expect(select).toBeVisible();
    await test
      .expect(select)
      .toHaveAttribute("aria-label", "Custom select label");
    await test.expect(select).not.toHaveAttribute("aria-labelledby");
  });

  test("form input with aria-label has no aria-labelledby", async ({ q }) => {
    const input = q.textbox("Custom input label");
    await test.expect(input).toBeVisible();
    await test
      .expect(input)
      .toHaveAttribute("aria-label", "Custom input label");
    await test.expect(input).not.toHaveAttribute("aria-labelledby");
  });

  test("group with aria-label has no aria-labelledby", async ({ q }) => {
    const group = q.group("Custom group label");
    await test.expect(group).toBeVisible();
    await test
      .expect(group)
      .toHaveAttribute("aria-label", "Custom group label");
    await test.expect(group).not.toHaveAttribute("aria-labelledby");
  });

  test("tooltip anchor with aria-label has no aria-labelledby", async ({
    q,
  }) => {
    const anchor = q.button("Custom anchor label");
    await test.expect(anchor).toBeVisible();
    await test
      .expect(anchor)
      .toHaveAttribute("aria-label", "Custom anchor label");
    await test.expect(anchor).not.toHaveAttribute("aria-labelledby");
  });
});
