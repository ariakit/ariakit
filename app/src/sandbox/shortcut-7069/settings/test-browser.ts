import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  // https://github.com/ariakit/ariakit/issues/7069
  test("platform and prose choices format resolved alternatives", async ({
    q,
  }) => {
    await test
      .expect(q.group("Shortcut assignments"))
      .toHaveAccessibleName("Shortcut assignments");
    const save = q.group("Save document settings");
    await q.radio("Windows").click();
    await q.radio("English prose").click();

    await test.expect(q.radio("Windows")).toBeChecked();
    await test.expect(q.radio("English prose")).toBeChecked();
    await test.expect(save).toContainText("Canonical: Control+S");
    await test.expect(save).toContainText("Control");
    await test
      .expect(q.textbox("Record shortcut for Save document"))
      .toHaveValue("Control + S");

    await q.radio("Apple").click();
    await test.expect(save).toContainText("Canonical: Meta+S");
    await test
      .expect(q.textbox("Record shortcut for Save document"))
      .toHaveValue("Command + S");

    await q.radio("German prose").click();
    await test
      .expect(q.textbox("Record shortcut for Save document"))
      .toHaveValue("Befehl + S");
  });

  // https://github.com/ariakit/ariakit/issues/7069
  test("clear uses null and reset restores the default", async ({ q }) => {
    const search = q.group("Quick search settings");
    const searchQuery = query(search);

    await q.button("Clear Quick search").click();
    await test.expect(searchQuery.text("Unassigned")).toBeVisible();
    await test.expect(search).toContainText("Canonical: null");
    await test
      .expect(q.textbox("Record shortcut for Quick search"))
      .toHaveValue("");

    await q.button("Reset Quick search").click();
    await test.expect(searchQuery.text("Unassigned")).toHaveCount(0);
    await test.expect(search).toContainText("Canonical: / Meta+P");
    await test
      .expect(q.textbox("Record shortcut for Quick search"))
      .toHaveValue("/ ⌘P");
  });

  // https://github.com/ariakit/ariakit/issues/7069
  test("recording remaps a shortcut through ShortcutInput", async ({
    page,
    q,
  }) => {
    const input = q.textbox("Record shortcut for Zoom in");
    const zoom = q.group("Zoom in settings");
    await input.click();
    await test
      .expect(input)
      .toHaveAttribute("aria-describedby", "zoom-in-recording-help");
    await test
      .expect(
        q.text(
          /Press a shortcut · Backspace or Delete clears · Escape cancels/,
        ),
      )
      .toBeVisible();

    await page.keyboard.press("Meta+J");
    await test.expect(input).toHaveValue("⌘J");
    await test.expect(zoom).toContainText("Canonical: Meta+J");
  });

  // https://github.com/ariakit/ariakit/issues/7069
  test("recomputes held modifiers when a key is released", async ({
    page,
    q,
  }) => {
    await q.radio("Windows").click();
    const input = q.textbox("Record shortcut for Save document");
    const save = q.group("Save document settings");
    await input.click();

    await page.keyboard.down("Control");
    await test.expect(input).toHaveValue("Ctrl");

    await page.keyboard.up("Control");
    await test.expect(input).toHaveValue("Ctrl+S");

    await page.keyboard.press("Control+J");
    await test.expect(input).toHaveValue("Ctrl+J");
    await test.expect(save).toContainText("Canonical: Control+J");
  });

  // https://github.com/ariakit/ariakit/issues/7069
  test("renders and triggers every resolved alternative", async ({
    page,
    q,
  }) => {
    const quickSearch = q.group("Quick search settings");
    const alternatives = quickSearch.locator(".shortcut-alternative");
    await test.expect(alternatives).toHaveCount(2);
    await test.expect(alternatives.nth(0)).toHaveText("/");
    await test.expect(alternatives.nth(1)).toHaveText(/or\s*⌘P/);
    await test.expect(quickSearch).toContainText("Canonical: / Meta+P");

    await q.button("Reset all").focus();
    await page.keyboard.press("/");
    await test
      .expect(q.status("Last command"))
      .toContainText("Quick search triggered");

    await q.button("Reset all").focus();
    await page.keyboard.press("Meta+P");
    await test
      .expect(q.status("Last command"))
      .toContainText("Quick search triggered");
  });

  // https://github.com/ariakit/ariakit/issues/7069
  test("recorded canonical keys conflict with resolved defaults", async ({
    page,
    q,
  }) => {
    const input = q.textbox("Record shortcut for Command palette");
    await input.click();
    await page.keyboard.press("Meta+S");

    await test.expect(input).toHaveValue("⌘S");
    await test
      .expect(q.group("Command palette settings"))
      .toContainText("Canonical: Meta+S");
    await test.expect(q.text("2 conflicting commands")).toBeVisible();
    await test
      .expect(q.group("Command palette settings"))
      .toContainText("Also assigned to Save document");
    await test
      .expect(q.group("Save document settings"))
      .toContainText("Also assigned to Command palette");
    await test
      .expect(input)
      .toHaveAttribute("aria-describedby", "command-palette-conflict");

    await input.click();
    await test
      .expect(input)
      .toHaveAttribute(
        "aria-describedby",
        "command-palette-recording-help command-palette-conflict",
      );
    await page.keyboard.press("Escape");
    await test.expect(input).toHaveValue("⌘S");
    await test
      .expect(q.group("Command palette settings"))
      .toContainText("Canonical: Meta+S");
    await test
      .expect(
        q.text(
          /Press a shortcut · Backspace or Delete clears · Escape cancels/,
        ),
      )
      .toHaveCount(0);
    await test
      .expect(input)
      .toHaveAttribute("aria-describedby", "command-palette-conflict");

    await input.click();
    await page.keyboard.press("Delete");
    await test.expect(input).toHaveValue("");
    await test
      .expect(q.group("Command palette settings"))
      .toContainText("Canonical: null");
    await test.expect(input).not.toHaveAttribute("aria-describedby");

    await q.button("Reset Command palette").click();
    await test.expect(input).toHaveValue("⌘K");
    await test
      .expect(q.group("Command palette settings"))
      .toContainText("Canonical: Meta+K");
    await test.expect(q.text("No shortcut conflicts")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/7069
  test("compares each resolved alternative independently", async ({ q }) => {
    await q.button("Try a duplicate assignment").click();
    await test
      .expect(q.group("Command palette settings"))
      .toContainText("Canonical: Meta+P");
    await test.expect(q.text("2 conflicting commands")).toBeVisible();
    await test
      .expect(q.group("Command palette settings"))
      .toContainText("Also assigned to Quick search");
    await test
      .expect(q.group("Quick search settings"))
      .toContainText("Also assigned to Command palette");
  });

  // https://github.com/ariakit/ariakit/issues/7069
  test("master switch pauses registered commands", async ({ page, q }) => {
    await q.button("Reset all").focus();
    await page.keyboard.press("Meta+S");
    await test
      .expect(q.status("Last command"))
      .toContainText("Save document triggered");

    await q.switch("Shortcuts").click();
    await test.expect(q.switch("Shortcuts")).not.toBeChecked();
    await page.keyboard.press("Meta+K");
    await test
      .expect(q.status("Last command"))
      .toContainText("Save document triggered");
    await test
      .expect(q.status("Last command"))
      .toContainText("Shortcuts paused");
  });

  // https://github.com/ariakit/ariakit/issues/7069
  test("shortcut settings with a conflict @visual", async ({ q, visual }) => {
    await q.button("Try a duplicate assignment").click();
    await test.expect(q.text("2 conflicting commands")).toBeVisible();
    await visual({
      viewports: { desktop: { height: 800, width: 1280 } },
    });
  });
});
