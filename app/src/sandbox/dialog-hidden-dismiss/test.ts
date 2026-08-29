import { click, focus, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// Modal dialogs keep the fallback dismiss button so that screen reader users
// aren't trapped in them. It renders next to the dialog rather than inside it,
// so a dialog element whose role doesn't allow a `button` among its owned
// elements doesn't get one.
// https://github.com/ariakit/ariakit/issues/4270
// https://github.com/ariakit/ariakit/issues/7310
test("modal dialog without a dismiss element gets a hidden one", async () => {
  await click(q.button("Terms"));
  const dialog = q.dialog("Terms");
  expect(dialog).toBeVisible();
  const dismiss = q.button("Dismiss popup");
  expect(dismiss).toBeInTheDocument();
  expect(dialog).not.toContainElement(dismiss);
  expect(q.within(dialog).button.all()).toHaveLength(0);
});

// Rendering it next to the dialog puts it outside every "inside the dialog"
// check, so the dialog has to keep treating it as its own.
// https://github.com/ariakit/ariakit/issues/7310
test("hidden dismiss closes the dialog and restores focus", async () => {
  await click(q.button("Terms"));
  expect(q.dialog("Terms")).toBeVisible();
  await click(q.button("Dismiss popup"));
  expect(q.dialog.maybe("Terms")).not.toBeInTheDocument();
  expect(q.button("Terms")).toHaveFocus();
});

// https://github.com/ariakit/ariakit/issues/7310
test("escape closes the dialog from the hidden dismiss", async () => {
  await click(q.button("Terms"));
  expect(q.dialog("Terms")).toBeVisible();
  await focus(q.button("Dismiss popup"));
  await press.Escape();
  expect(q.dialog.maybe("Terms")).not.toBeInTheDocument();
});

// A dialog that never takes focus keeps checking whether each event target is
// one of its own, and the hidden dismiss button renders outside it.
// https://github.com/ariakit/ariakit/issues/7310
test("hidden dismiss doesn't count as outside a dialog that never took focus", async () => {
  await click(q.button("Preferences"));
  expect(q.dialog("Preferences")).toBeVisible();
  await focus(q.button("Dismiss popup"));
  // The button is still there to be focused, which is already half the
  // assertion: closing the dialog would take it with it.
  expect(q.button("Dismiss popup")).toHaveFocus();
  expect(q.dialog("Preferences")).toBeVisible();
});

// https://github.com/ariakit/ariakit/issues/4270
test("modal dialog with a dismiss element gets no hidden one", async () => {
  await click(q.button("Receipt"));
  const dialog = q.dialog("Receipt");
  expect(dialog).toBeVisible();
  expect(q.button.maybe("Dismiss popup")).not.toBeInTheDocument();
  expect(q.within(dialog).button.all()).toHaveLength(1);
  expect(q.within(dialog).button("Done")).toBeInTheDocument();
});
