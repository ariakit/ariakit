import { click, hover, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/7115
test("shows the tooltip on hover when the anchor renders the disabled button", async () => {
  await hover(q.button("Delete file"));
  expect(q.tooltip("You need permission to delete files")).toBeVisible();
});

// https://github.com/ariakit/ariakit/issues/7115
test("shows the tooltip on hover when the disabled button renders the anchor", async () => {
  await hover(q.button("Share file"));
  expect(q.tooltip("You need permission to share files")).toBeVisible();
});

// https://github.com/ariakit/ariakit/issues/7115
test("shows the tooltip on keyboard focus in both composition orders", async () => {
  await press.Tab();
  expect(q.button("Delete file")).toHaveFocus();
  expect(q.tooltip("You need permission to delete files")).toBeVisible();
  await press.Tab();
  expect(q.button("Share file")).toHaveFocus();
  expect(q.tooltip("You need permission to share files")).toBeVisible();
});

test("keeps truly disabled anchors out of pointer reach", async () => {
  // Focusable applies `pointer-events: none` to truly disabled elements, so no
  // mouse move can reach these anchors and the shield is the behavior here. The
  // hover decision is covered by the "Duplicate file" test, where it's lifted.
  expect(q.button("Rename file")).toHaveStyle("pointer-events: none");
  expect(q.button("Move file")).toHaveStyle("pointer-events: none");
});

test("does not show the tooltip on hover for a truly disabled anchor that keeps pointer events", async () => {
  // Restoring pointer events is what makes this the hover decision's own test:
  // the mouse move reaches the anchor and only the resolved disabled state can
  // keep the tooltip closed.
  expect(q.button("Duplicate file")).toHaveStyle("pointer-events: auto");
  await hover(q.button("Duplicate file"));
  expect(q.tooltip("Duplicating is unavailable")).not.toBeInTheDocument();
});

test("does not activate accessible disabled anchors", async () => {
  await click(q.button("Delete file"));
  expect(q.text("Activations: 0")).toBeInTheDocument();
  await click(q.button("Share file"));
  expect(q.text("Activations: 0")).toBeInTheDocument();
  // The same handler on an enabled button, so the assertions above fail if the
  // counter ever stops counting rather than if the clicks are suppressed.
  await click(q.button("Download file"));
  expect(q.text("Activations: 1")).toBeInTheDocument();
});
