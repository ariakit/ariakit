import { click, q, type } from "@ariakit/test";
import { expect, test } from "vitest";

// Gaining or losing the backdrop must only mount or unmount the backdrop. The
// backdrop renders as a sibling before the dialog, so rendering that sibling
// only while the prop is truthy moves the dialog to another position among its
// parent's children, and React remounts everything inside it.
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
  expect(q.textbox("Message")).toHaveValue("Ship it");
  expect(q.status()).toHaveTextContent("Attachments: 2");
  expect(q.dialog("Compose")).toBe(dialog);

  await click(q.checkbox("Dim the background"));
  expect(q.presentation()).toBeVisible();
  expect(q.textbox("Message")).toHaveValue("Ship it");
  expect(q.status()).toHaveTextContent("Attachments: 2");
  expect(q.dialog("Compose")).toBe(dialog);
});

// Changing the backdrop's own appearance re-renders the dialog with a new
// backdrop element while the backdrop stays truthy, so the number of children
// never changes. This passes today: it's the control that tells the
// falsy/truthy boundary apart from an ordinary re-render.
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

// A dialog that renders inline is reconciled among its own parent's children
// rather than the portal's, so it needs the same stable position.
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
