import { click, dispatch, focus, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/7069
test("platform and prose choices format resolved alternatives", async () => {
  expect(q.group("Shortcut assignments")).toHaveAccessibleName(
    "Shortcut assignments",
  );
  const save = q.group("Save document settings");
  await click(q.radio("Windows"));
  await click(q.radio("English prose"));

  expect(q.radio("Windows")).toBeChecked();
  expect(q.radio("English prose")).toBeChecked();
  expect(save).toHaveTextContent("Canonical: Control+S");
  expect(save).toHaveTextContent("Control");
  expect(q.textbox("Record shortcut for Save document")).toHaveValue(
    "Control + S",
  );

  await click(q.radio("Apple"));
  expect(save).toHaveTextContent("Canonical: Meta+S");
  expect(q.textbox("Record shortcut for Save document")).toHaveValue(
    "Command + S",
  );

  await click(q.radio("German prose"));
  expect(q.textbox("Record shortcut for Save document")).toHaveValue(
    "Befehl + S",
  );
});

// https://github.com/ariakit/ariakit/issues/7069
test("clear uses null and reset restores the default", async () => {
  const search = q.group("Quick search settings");
  const searchQuery = q.within(search);

  await click(q.button("Clear Quick search"));
  expect(searchQuery.text("Unassigned")).toBeVisible();
  expect(search).toHaveTextContent("Canonical: null");
  expect(q.textbox("Record shortcut for Quick search")).toHaveValue("");

  await click(q.button("Reset Quick search"));
  expect(searchQuery.text.maybe("Unassigned")).not.toBeInTheDocument();
  expect(search).toHaveTextContent("Canonical: / Meta+P");
  expect(q.textbox("Record shortcut for Quick search")).toHaveValue("/ ⌘P");
});

// https://github.com/ariakit/ariakit/issues/7069
test("recording remaps a shortcut through ShortcutInput", async () => {
  const input = q.textbox("Record shortcut for Zoom in");
  const zoom = q.group("Zoom in settings");
  await click(input);
  expect(input).toHaveAttribute("aria-describedby", "zoom-in-recording-help");
  expect(
    q.text("Press a shortcut · Backspace or Delete clears · Escape cancels"),
  ).toBeVisible();

  await press("j", null, { metaKey: true });
  expect(input).toHaveValue("⌘J");
  expect(zoom).toHaveTextContent("Canonical: Meta+J");
});

// https://github.com/ariakit/ariakit/issues/7069
test("recomputes held modifiers when a key is released", async () => {
  await click(q.radio("Windows"));
  const input = q.textbox("Record shortcut for Save document");
  const save = q.group("Save document settings");
  await click(input);

  await dispatch.keyDown(input, {
    code: "ControlLeft",
    ctrlKey: true,
    key: "Control",
  });
  expect(input).toHaveValue("Ctrl");

  await dispatch.keyUp(input, { code: "ControlLeft", key: "Control" });
  expect(input).toHaveValue("Ctrl+S");

  await press("j", null, { ctrlKey: true });
  expect(input).toHaveValue("Ctrl+J");
  expect(save).toHaveTextContent("Canonical: Control+J");
});

// https://github.com/ariakit/ariakit/issues/7069
test("renders and triggers every resolved alternative", async () => {
  const quickSearch = q.group("Quick search settings");
  const alternatives = quickSearch.querySelectorAll(".shortcut-alternative");
  expect(alternatives).toHaveLength(2);
  expect(alternatives.item(0)).toHaveTextContent("/");
  expect(alternatives.item(1)).toHaveTextContent(/or\s*⌘P/);
  expect(quickSearch).toHaveTextContent("Canonical: / Meta+P");

  await focus(q.button("Reset all"));
  await press("/");
  expect(q.status("Last command")).toHaveTextContent("Quick search triggered");

  await focus(q.button("Reset all"));
  await press("p", null, { metaKey: true });
  expect(q.status("Last command")).toHaveTextContent("Quick search triggered");
});

// https://github.com/ariakit/ariakit/issues/7069
test("recorded canonical keys conflict with resolved defaults", async () => {
  const input = q.textbox("Record shortcut for Command palette");
  await click(input);
  await press("s", null, { metaKey: true });

  expect(input).toHaveValue("⌘S");
  expect(q.group("Command palette settings")).toHaveTextContent(
    "Canonical: Meta+S",
  );
  expect(q.text("2 conflicting commands")).toBeVisible();
  expect(q.group("Command palette settings")).toHaveTextContent(
    "Also assigned to Save document",
  );
  expect(q.group("Save document settings")).toHaveTextContent(
    "Also assigned to Command palette",
  );
  expect(input).toHaveAttribute("aria-describedby", "command-palette-conflict");

  await click(input);
  expect(input).toHaveAttribute(
    "aria-describedby",
    "command-palette-recording-help command-palette-conflict",
  );
  await press.Escape();
  expect(input).toHaveValue("⌘S");
  expect(q.group("Command palette settings")).toHaveTextContent(
    "Canonical: Meta+S",
  );
  expect(
    q.text.maybe(
      "Press a shortcut · Backspace or Delete clears · Escape cancels",
    ),
  ).not.toBeInTheDocument();
  expect(input).toHaveAttribute("aria-describedby", "command-palette-conflict");

  await click(input);
  await press.Backspace();
  expect(input).toHaveValue("");
  expect(q.group("Command palette settings")).toHaveTextContent(
    "Canonical: null",
  );
  expect(input).not.toHaveAttribute("aria-describedby");

  await click(q.button("Reset Command palette"));
  expect(input).toHaveValue("⌘K");
  expect(q.group("Command palette settings")).toHaveTextContent(
    "Canonical: Meta+K",
  );
  expect(q.text("No shortcut conflicts")).toBeVisible();
});

// https://github.com/ariakit/ariakit/issues/7069
test("compares each resolved alternative independently", async () => {
  await click(q.button("Try a duplicate assignment"));
  expect(q.group("Command palette settings")).toHaveTextContent(
    "Canonical: Meta+P",
  );
  expect(q.text("2 conflicting commands")).toBeVisible();
  expect(q.group("Command palette settings")).toHaveTextContent(
    "Also assigned to Quick search",
  );
  expect(q.group("Quick search settings")).toHaveTextContent(
    "Also assigned to Command palette",
  );
});

// https://github.com/ariakit/ariakit/issues/7069
test("master switch pauses registered commands", async () => {
  await focus(q.button("Reset all"));
  await press("s", null, { metaKey: true });
  expect(q.status("Last command")).toHaveTextContent("Save document triggered");

  await click(q.switch("Shortcuts"));
  expect(q.switch("Shortcuts")).not.toBeChecked();
  await press("k", null, { metaKey: true });
  expect(q.status("Last command")).toHaveTextContent("Save document triggered");
  expect(q.status("Last command")).toHaveTextContent("Shortcuts paused");
});
