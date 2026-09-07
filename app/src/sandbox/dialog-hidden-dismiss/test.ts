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

// A nested popover renders inline inside the dialog and stays rendered while
// closed, so its dismiss button is in the dialog's subtree before the user
// opens the popover. It closes the popover, so the dialog still needs its own
// fallback. https://github.com/ariakit/ariakit/issues/7321
test("dismiss owned by a nested popup doesn't replace the hidden one", async () => {
  await click(q.button("Compose"));
  const dialog = q.dialog("Compose");
  expect(dialog).toBeVisible();
  expect(dialog).toContainElement(q.button.hidden("Close formatting"));
  expect(q.button("Dismiss popup")).toBeInTheDocument();

  await click(q.button("Formatting"));
  expect(q.dialog("Formatting")).toBeVisible();
  // The popover being open is when its dismiss button is on screen, and the
  // dialog still has no dismiss of its own.
  expect(q.button("Dismiss popup")).toBeInTheDocument();

  await click(q.button("Close formatting"));
  expect(q.dialog.maybe("Formatting")).not.toBeInTheDocument();
  expect(dialog).toBeVisible();
  expect(q.button("Dismiss popup")).toBeInTheDocument();
});

// A dismiss button the dialog does own is still its own when a nested popup's
// comes first in document order, and when it sits in a wrapper element rather
// than directly under the dialog.
// https://github.com/ariakit/ariakit/issues/7321
test("dialog owning a dismiss after a nested popup's gets no hidden one", async () => {
  await click(q.button("Share"));
  const dialog = q.dialog("Share");
  expect(dialog).toBeVisible();
  expect(dialog).toContainElement(q.button.hidden("Close permissions"));
  expect(q.within(dialog).button("Cancel")).toBeInTheDocument();
  expect(q.button.maybe("Dismiss popup")).not.toBeInTheDocument();
});

// The same composition through the menu modules. A submenu is never modal, so
// it renders inline inside the modal menu, and its dismiss button closes the
// submenu alone. https://github.com/ariakit/ariakit/issues/7321
test("dismiss owned by a submenu doesn't replace the hidden one", async () => {
  await click(q.button("Tools"));
  const menu = q.menu("Tools");
  expect(menu).toBeVisible();
  expect(menu).toContainElement(q.button.hidden("Close submenu"));
  expect(q.button("Dismiss popup")).toBeInTheDocument();

  // Same again once the submenu is open, which is when its dismiss button is on
  // screen and the modal menu still has no dismiss of its own.
  await click(q.menuitem("More"));
  expect(q.menu("More")).toBeVisible();
  expect(q.button("Dismiss popup")).toBeInTheDocument();
});

// Whether the dialog needs the fallback can change while it stays open. A
// dialog that loads its content gains a dismiss control, and the fallback has
// to step aside instead of leaving two of them behind.
// https://github.com/ariakit/ariakit/issues/7321
test("dismiss mounted while the dialog is open replaces the hidden one", async () => {
  await click(q.button("Activity"));
  const dialog = q.dialog("Activity");
  expect(dialog).toBeVisible();
  expect(q.button("Dismiss popup")).toBeInTheDocument();

  await click(q.button("Load entries"));
  expect(q.within(dialog).button("Close")).toBeInTheDocument();
  expect(q.button.maybe("Dismiss popup")).not.toBeInTheDocument();
});

// The other direction: a dialog that starts a task it can't cancel loses the
// dismiss control it had, and the fallback has to come back.
// https://github.com/ariakit/ariakit/issues/7321
test("dismiss unmounted while the dialog is open brings the hidden one back", async () => {
  await click(q.button("Remove photo"));
  const dialog = q.dialog("Remove photo");
  expect(dialog).toBeVisible();
  expect(q.button.maybe("Dismiss popup")).not.toBeInTheDocument();

  await click(q.button("Remove"));
  expect(q.within(dialog).button.maybe("Keep photo")).not.toBeInTheDocument();
  expect(q.button("Dismiss popup")).toBeInTheDocument();
});
