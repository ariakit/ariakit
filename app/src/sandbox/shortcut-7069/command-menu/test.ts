import { click, dispatch, focus, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

function getModOptions() {
  return navigator.platform.includes("Mac")
    ? { metaKey: true }
    : { ctrlKey: true };
}

// https://github.com/ariakit/ariakit/issues/7069
test("keyboard shortcuts respect textbox scope", async () => {
  const status = q.status("Last shortcut");
  const canvas = q.article("Document canvas");
  await focus(canvas);

  await press("s", null, getModOptions());
  expect(status).toHaveTextContent("Document saved");
  expect(status).toHaveTextContent("Source: Keyboard");
  expect(status).toHaveTextContent("Keys:");

  const editor = q.textbox("Document body") as HTMLTextAreaElement;
  await focus(editor);
  await press("g");
  expect(editor.value).toMatch(/g$/);
  expect(status).toHaveTextContent("Document saved");

  await focus(canvas);
  await press("g");
  expect(status).toHaveTextContent("Overview opened");
});

// https://github.com/ariakit/ariakit/issues/7069
test("references bridge clicks and store triggers to a headless command", async () => {
  const status = q.status("Last shortcut");

  await click(q.button("Bold"));
  expect(status).toHaveTextContent("Bold applied");
  expect(status).toHaveTextContent("Source: Toolbar");

  await press("b", null, getModOptions());
  expect(status).toHaveTextContent("Bold removed");
  expect(status).toHaveTextContent("Source: Keyboard");

  await click(q.button("Save"));
  expect(status).toHaveTextContent("Source: Toolbar");

  await click(q.button("More"));
  await click(q.menuitem("Save document"));
  expect(status).toHaveTextContent("Source: Menu");

  await click(q.button("More"));
  await click(q.menuitem("Save from code"));
  expect(status).toHaveTextContent("Source: Programmatic");
});

// https://github.com/ariakit/ariakit/issues/7069
test("the command palette triggers registered commands", async () => {
  await focus(q.article("Document canvas"));
  await press("k", null, getModOptions());
  expect(q.dialog("Command palette")).toBeVisible();
  expect(q.textbox("Search commands")).toHaveFocus();
  expect(q.text("Shift + Tab")).toBeVisible();
  const saveCommand = q.button("Save document");
  expect(saveCommand).toHaveAccessibleName("Save document");
  expect(saveCommand).toHaveAttribute("aria-keyshortcuts");
  await press.Tab();
  expect(saveCommand).toHaveFocus();
  await press.Enter();
  expect(q.dialog.maybe("Command palette")).not.toBeInTheDocument();
  expect(q.status("Last shortcut")).toHaveTextContent(
    "Source: Command palette",
  );
});

// https://github.com/ariakit/ariakit/issues/7069
test("falls back from disabled and inert command references", async () => {
  expect(q.group("Same-name command references")).toHaveAccessibleName(
    "Same-name command references",
  );
  expect(q.button(/^Disabled reference/)).toBeDisabled();
  const disabledShortcut = document.querySelector<HTMLElement>(
    "[data-disabled-explicit-shortcut]",
  );
  expect(disabledShortcut?.style.visibility).toBe("hidden");
  expect(q.text("Inert reference")).toBeVisible();
  const separator = q.text("or");
  expect(separator).toBeVisible();
  expect(separator).not.toHaveAttribute("aria-hidden");

  await focus(q.button("Live reference"));
  await press("r");
  expect(q.status("Reference fallback")).toHaveTextContent(
    "Live reference handled R · Runs: 1",
  );
});

// https://github.com/ariakit/ariakit/issues/7069
test("types a bare printable shortcut in a number input", async () => {
  const input = q.spinbutton("Estimate points");
  const status = q.status("Number input shortcut");

  await focus(input);
  // Number inputs do not expose the selection API used by the test typing
  // helper. Assert that the shortcut leaves the key's browser default intact,
  // then apply the input event that default action produces.
  const defaultAllowed = await dispatch.keyDown(input, {
    code: "Digit7",
    key: "7",
  });
  expect(defaultAllowed).toBe(true);
  await dispatch.input(input, {
    data: "7",
    inputType: "insertText",
    target: { value: "7" },
  });
  await dispatch.keyUp(input, { code: "Digit7", key: "7" });
  expect(input).toHaveValue(7);
  expect(status).toHaveTextContent("Shortcut runs: 0");

  await focus(q.button("Try 7 outside"));
  await press("7");
  expect(status).toHaveTextContent("Shortcut runs: 1");
});

// https://github.com/ariakit/ariakit/issues/7069
test("continues after a shortcut candidate declines", async () => {
  await focus(q.button("Try candidate chain"));
  await press("x");
  expect(q.status("Declining candidate")).toHaveTextContent(
    "Declined: 1 · Fallbacks: 1",
  );
});

// https://github.com/ariakit/ariakit/issues/7069
test("programmatically triggers an inactive explicitly scoped command", async () => {
  expect(q.region("Scoped review region")).toHaveAccessibleName(
    "Scoped review region",
  );
  const trigger = q.button("Run scoped command outside");
  const status = q.status("Scoped command");

  await focus(trigger);
  await press("e");
  expect(status).toHaveTextContent("Scoped command runs: 0");

  await click(trigger);
  expect(status).toHaveTextContent("Scoped command runs: 1");
});

// https://github.com/ariakit/ariakit/issues/7069
test("the master switch and disabled commands prevent activation", async () => {
  expect(q.button("Publish")).toBeDisabled();
  await click(q.switch("Shortcuts"));
  expect(q.switch("Shortcuts")).not.toBeChecked();
  await focus(q.article("Document canvas"));
  await press("s", null, getModOptions());
  expect(q.status("Last shortcut")).toHaveTextContent("Waiting for a shortcut");
});

// https://github.com/ariakit/ariakit/issues/7069
test("paused actions do not leak their source after resume", async () => {
  const shortcutSwitch = q.switch("Shortcuts");
  const canvas = q.article("Document canvas");
  const status = q.status("Last shortcut");
  const resumeAndSaveFromKeyboard = async () => {
    await click(shortcutSwitch);
    await focus(canvas);
    await press("s", null, getModOptions());
    expect(status).toHaveTextContent("Source: Keyboard");
  };

  await click(shortcutSwitch);
  await click(q.button("Save"));
  expect(status).toHaveTextContent("Waiting for a shortcut");
  await resumeAndSaveFromKeyboard();

  await click(shortcutSwitch);
  await click(q.button("More"));
  await click(q.menuitem("Save document"));
  expect(status).toHaveTextContent("Source: Keyboard");
  await resumeAndSaveFromKeyboard();

  await click(shortcutSwitch);
  await click(q.button("More"));
  await click(q.menuitem("Save from code"));
  expect(status).toHaveTextContent("Source: Keyboard");
  await resumeAndSaveFromKeyboard();
});
