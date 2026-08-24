import type { Locator, Page } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

async function getShortcut(command: Locator) {
  const keys = await command.getAttribute("aria-keyshortcuts");
  if (!keys) {
    throw new Error("Expected command to advertise aria-keyshortcuts");
  }
  const [firstKeys] = keys.split(" ");
  if (!firstKeys) {
    throw new Error("Expected command to advertise a shortcut");
  }
  return firstKeys;
}

async function pressShortcut(page: Page, command: Locator) {
  await page.keyboard.press(await getShortcut(command));
}

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7069
  test("keyboard shortcuts respect textbox scope", async ({ page, q }) => {
    const status = q.status("Last shortcut");
    const canvas = q.article("Document canvas");
    await canvas.focus();

    await pressShortcut(page, q.button("Save"));
    await test.expect(status).toContainText("Document saved");
    await test.expect(status).toContainText("Source: Keyboard");
    await test.expect(status).toContainText("Keys:");

    const editor = q.textbox("Document body");
    await editor.focus();
    await page.keyboard.press("g");
    await test.expect(editor).toHaveValue(/^g/);
    await test.expect(status).toContainText("Document saved");

    await canvas.focus();
    await page.keyboard.press("g");
    await test.expect(status).toContainText("Overview opened");
  });

  // https://github.com/ariakit/ariakit/issues/7069
  test("references bridge clicks and store triggers to a headless command", async ({
    page,
    q,
  }) => {
    const status = q.status("Last shortcut");

    await q.button("Bold").click();
    await test.expect(status).toContainText("Bold applied");
    await test.expect(status).toContainText("Source: Toolbar");

    await pressShortcut(page, q.button("Bold"));
    await test.expect(status).toContainText("Bold removed");
    await test.expect(status).toContainText("Source: Keyboard");

    await q.button("Save").click();
    await test.expect(status).toContainText("Source: Toolbar");

    await q.button("More").click();
    await q.menuitem("Save document").click();
    await test.expect(status).toContainText("Source: Menu");

    await q.button("More").click();
    await q.menuitem("Save from code").click();
    await test.expect(status).toContainText("Source: Programmatic");
  });

  // https://github.com/ariakit/ariakit/issues/7069
  test("the command palette triggers registered commands", async ({
    page,
    q,
  }) => {
    await q.article("Document canvas").focus();
    await pressShortcut(page, q.button("Commands"));
    await test.expect(q.dialog("Command palette")).toBeVisible();
    await test.expect(q.textbox("Search commands")).toBeFocused();
    await test.expect(q.text("Shift + Tab")).toBeVisible();
    const saveCommand = q.button("Save document");
    await test.expect(saveCommand).toHaveAccessibleName("Save document");
    await test.expect(saveCommand).toHaveAttribute("aria-keyshortcuts", /S$/);
    await page.keyboard.press("Tab");
    await test.expect(saveCommand).toBeFocused();
    await page.keyboard.press("Enter");
    await test.expect(q.dialog("Command palette")).toHaveCount(0);
    await test
      .expect(q.status("Last shortcut"))
      .toContainText("Source: Command palette");
  });

  // https://github.com/ariakit/ariakit/issues/7069
  test("falls back from disabled and inert command references", async ({
    page,
    q,
  }) => {
    await test
      .expect(q.group("Same-name command references"))
      .toHaveAccessibleName("Same-name command references");
    await test.expect(q.button(/^Disabled reference/)).toBeDisabled();
    await test
      .expect(page.locator("[data-disabled-explicit-shortcut]"))
      .toHaveCSS("visibility", "hidden");
    await test.expect(q.text(/^Inert reference/)).toBeVisible();
    await test.expect(q.text("or")).toBeVisible();
    await test.expect(q.text("or")).not.toHaveAttribute("aria-hidden", "true");

    await q.button("Live reference").focus();
    await page.keyboard.press("r");
    await test
      .expect(q.status("Reference fallback"))
      .toContainText("Live reference handled R · Runs: 1");
  });

  // https://github.com/ariakit/ariakit/issues/7069
  test("types a bare printable shortcut in a number input", async ({
    page,
    q,
  }) => {
    const input = q.spinbutton("Estimate points");
    const status = q.status("Number input shortcut");

    await input.focus();
    await page.keyboard.press("7");
    await test.expect(input).toHaveValue("7");
    await test.expect(status).toContainText("Shortcut runs: 0");

    await q.button("Try 7 outside").focus();
    await page.keyboard.press("7");
    await test.expect(status).toContainText("Shortcut runs: 1");
  });

  // https://github.com/ariakit/ariakit/issues/7069
  test("continues after a shortcut candidate declines", async ({ page, q }) => {
    await q.button("Try candidate chain").focus();
    await page.keyboard.press("x");
    await test
      .expect(q.status("Declining candidate"))
      .toContainText("Declined: 1 · Fallbacks: 1");
  });

  // https://github.com/ariakit/ariakit/issues/7069
  test("programmatically triggers an inactive explicitly scoped command", async ({
    page,
    q,
  }) => {
    await test
      .expect(q.region("Scoped review region"))
      .toHaveAccessibleName("Scoped review region");
    const trigger = q.button("Run scoped command outside");
    const status = q.status("Scoped command");

    await trigger.focus();
    await page.keyboard.press("e");
    await test.expect(status).toContainText("Scoped command runs: 0");

    await trigger.click();
    await test.expect(status).toContainText("Scoped command runs: 1");
  });

  // https://github.com/ariakit/ariakit/issues/7069
  test("the master switch and disabled commands prevent activation", async ({
    page,
    q,
  }) => {
    const saveShortcut = await getShortcut(q.button("Save"));
    await test.expect(q.button("Publish")).toBeDisabled();
    await q.switch("Shortcuts").click();
    await test.expect(q.switch("Shortcuts")).not.toBeChecked();
    await q.article("Document canvas").focus();
    await page.keyboard.press(saveShortcut);
    await test
      .expect(q.status("Last shortcut"))
      .toContainText("Waiting for a shortcut");
  });

  // https://github.com/ariakit/ariakit/issues/7069
  test("paused actions do not leak their source after resume", async ({
    page,
    q,
  }) => {
    const shortcutSwitch = q.switch("Shortcuts");
    const canvas = q.article("Document canvas");
    const status = q.status("Last shortcut");
    const saveShortcut = await getShortcut(q.button("Save"));
    const resumeAndSaveFromKeyboard = async () => {
      await shortcutSwitch.click();
      await canvas.focus();
      await page.keyboard.press(saveShortcut);
      await test.expect(status).toContainText("Source: Keyboard");
    };

    await shortcutSwitch.click();
    await q.button("Save").click();
    await test.expect(status).toContainText("Waiting for a shortcut");
    await resumeAndSaveFromKeyboard();

    await shortcutSwitch.click();
    await q.button("More").click();
    await q.menuitem("Save document").click();
    await test.expect(status).toContainText("Source: Keyboard");
    await resumeAndSaveFromKeyboard();

    await shortcutSwitch.click();
    await q.button("More").click();
    await q.menuitem("Save from code").click();
    await test.expect(status).toContainText("Source: Keyboard");
    await resumeAndSaveFromKeyboard();
  });

  // https://github.com/ariakit/ariakit/issues/7069
  test("open command palette @visual", async ({ q, visual }) => {
    await q.button("Commands").click();
    await test.expect(q.dialog("Command palette")).toBeVisible();
    await visual({
      viewports: { desktop: { height: 800, width: 1280 } },
    });
  });
});
