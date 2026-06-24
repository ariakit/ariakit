import { q } from "@ariakit/test";
import { expect, test } from "vitest";

// Reproduces https://github.com/ariakit/ariakit/issues/6330
test("exposes standalone TagRemove with visible text as a named button", () => {
  const removeButton = q.button.ensure("Remove React filter");
  expect(removeButton).not.toHaveAttribute("aria-hidden", "true");
  expect(
    document.querySelector(
      '[aria-label="Press Delete or Backspace to remove"]',
    ),
  ).toHaveAttribute("aria-hidden", "true");
  expect(q.button("Remove React")).not.toBeInTheDocument();
});

test("labels an icon-only standalone TagRemove from its value", () => {
  const removeButton = q.button.ensure("Remove Vue");
  expect(removeButton).not.toHaveAttribute("aria-hidden", "true");
});

test("preserves a standalone render element name", () => {
  const removeButton = q.button.ensure("Remove Svelte filter");
  expect(removeButton).not.toHaveAttribute("aria-hidden", "true");
  expect(q.button("Remove Svelte")).not.toBeInTheDocument();
});

test("labels an icon-only standalone render element from its value", () => {
  const removeButton = q.button.ensure("Remove Ember");
  expect(removeButton).not.toHaveAttribute("aria-hidden", "true");
});

test("preserves a standalone render element image name", () => {
  const removeButton = q.button.ensure("Remove Preact filter");
  expect(removeButton).not.toHaveAttribute("aria-hidden", "true");
  expect(q.button("Remove Preact")).not.toBeInTheDocument();
});

test("preserves a standalone render element labelledby name", () => {
  const removeButton = q.button.ensure("Remove Alpine filter");
  expect(removeButton).not.toHaveAttribute("aria-hidden", "true");
  expect(removeButton).not.toHaveAttribute("aria-label");
  expect(q.button("Remove Alpine")).not.toBeInTheDocument();
});

test("preserves a standalone root labelledby name", () => {
  const removeButton = q.button.ensure("Remove Solid filter");
  expect(removeButton).not.toHaveAttribute("aria-hidden", "true");
  expect(removeButton).not.toHaveAttribute("aria-label");
  expect(q.button("Remove Solid")).not.toBeInTheDocument();
});
