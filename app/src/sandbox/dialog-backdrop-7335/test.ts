import { click, q, type } from "@ariakit/test";
import { expect, test } from "vitest";

// Gaining or losing the backdrop must only mount or unmount the backdrop.
// https://github.com/ariakit/ariakit/issues/7335
test("backdrop toggle keeps the contents of a modal dialog", async () => {
  await click(q.button("Compose"));
  const dialog = q.dialog("Compose");
  expect(dialog).toBeVisible();
  await type("Ship it", q.textbox("Message"));
  await click(q.button("Add attachment"));
  await click(q.button("Add attachment"));
  expect(q.status()).toHaveTextContent("Attachments: 2");
  expect(q.presentation()).toBeVisible();

  await click(q.checkbox("Dim the background"));
  // Role queries skip elements hidden from the accessibility tree, so this
  // asserts that no backdrop is shown, not that no element is mounted.
  expect(q.presentation.maybe()).not.toBeInTheDocument();
  // Guards the selector below against a missing id.
  expect(dialog.id).toBeTruthy();
  // Losing the backdrop has to unmount it, not just hide it. This passes before
  // the fix too, and rules out the userland workaround's shape, which keeps a
  // hidden backdrop mounted.
  expect(
    document.querySelectorAll(`[data-backdrop="${dialog.id}"]`),
  ).toHaveLength(0);
  expect(q.textbox("Message")).toHaveValue("Ship it");
  expect(q.status()).toHaveTextContent("Attachments: 2");
  expect(q.dialog("Compose")).toBe(dialog);

  await click(q.checkbox("Dim the background"));
  expect(q.presentation()).toBeVisible();
  expect(q.textbox("Message")).toHaveValue("Ship it");
  expect(q.status()).toHaveTextContent("Attachments: 2");
  expect(q.dialog("Compose")).toBe(dialog);
});

// Keeps the backdrop truthy, so this passes before the fix too: it's the
// control that separates the falsy/truthy boundary from an ordinary re-render.
// https://github.com/ariakit/ariakit/issues/7335
test("changing the backdrop's appearance keeps the contents", async () => {
  await click(q.button("Compose"));
  const dialog = q.dialog("Compose");
  expect(dialog).toBeVisible();
  await type("Ship it", q.textbox("Message"));
  await click(q.button("Add attachment"));
  expect(q.presentation()).not.toHaveClass("backdrop-high");

  await click(q.checkbox("High contrast backdrop"));
  expect(q.presentation()).toHaveClass("backdrop-high");
  expect(q.textbox("Message")).toHaveValue("Ship it");
  expect(q.status()).toHaveTextContent("Attachments: 1");
  expect(q.dialog("Compose")).toBe(dialog);
});

// The same toggle on an inline, non-modal dialog.
// https://github.com/ariakit/ariakit/issues/7335
test("backdrop toggle keeps the contents of an inline dialog", async () => {
  await click(q.button("Quick note"));
  const dialog = q.dialog("Quick note");
  expect(dialog).toBeVisible();
  await type("Buy milk", q.textbox("Note"));
  await click(q.button("Add attachment"));
  expect(q.status()).toHaveTextContent("Attachments: 1");
  expect(q.presentation()).toBeVisible();

  await click(q.checkbox("Dim the background"));
  expect(q.presentation.maybe()).not.toBeInTheDocument();
  expect(q.textbox("Note")).toHaveValue("Buy milk");
  expect(q.status()).toHaveTextContent("Attachments: 1");
  expect(q.dialog("Quick note")).toBe(dialog);

  await click(q.checkbox("Dim the background"));
  expect(q.presentation()).toBeVisible();
  expect(q.textbox("Note")).toHaveValue("Buy milk");
  expect(q.status()).toHaveTextContent("Attachments: 1");
  expect(q.dialog("Quick note")).toBe(dialog);
});
