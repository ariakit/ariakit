import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("renders native Role helpers and forwards refs and props", async ({
    q,
  }) => {
    await test.expect(q.text("⌘K")).toHaveJSProperty("tagName", "KBD");
    await test.expect(q.text("⌘K")).toHaveAttribute("title", "Command K");
    await test.expect(q.separator()).toHaveJSProperty("tagName", "HR");
    await test.expect(q.separator()).toHaveAttribute("aria-label", "Commands");
    await test
      .expect(q.text("September 9"))
      .toHaveAttribute("datetime", "2026-09-09");
    await test.expect(q.cell("Open search")).toHaveJSProperty("tagName", "TD");
    await test.expect(q.cell("Open search")).toHaveAttribute("colspan", "2");
    await test.expect(q.group("Settings")).toHaveAttribute("disabled", "");
    await test
      .expect(q.option("Keyboard"))
      .toHaveAttribute("value", "keyboard");
    await q.button("Inspect elements").click();
    await test
      .expect(q.status("Element refs"))
      .toHaveText("kbd, hr, time, td, fieldset, option");
  });

  test("preserves render replacement and framework wrapping", async ({ q }) => {
    await test.expect(q.text("Ctrl K")).toHaveJSProperty("tagName", "SPAN");
    await test.expect(q.text("Ctrl K")).toHaveAttribute("title", "Control K");
    await test.expect(q.group("Shortcut")).toContainText("Ctrl K");
    await q.button("Inspect elements").click();
    await test.expect(q.status("Composed ref")).toHaveText("span");
  });
});
