import { q } from "@ariakit/test";
import { expect, test } from "vitest";

// Reproduces https://github.com/ariakit/ariakit/issues/6330
test("exposes standalone TagRemove with visible text as a named button", () => {
  const removeButton = q.button("Remove React filter");
  expect(removeButton).not.toHaveAttribute("aria-hidden", "true");
  expect(removeButton).not.toHaveAttribute("aria-label");
  const tagRemove = document.querySelector(
    '[aria-label="Press Delete or Backspace to remove"]',
  );
  expect(tagRemove).toHaveAttribute("aria-hidden", "true");
  expect(tagRemove?.querySelector("svg")).toBeInTheDocument();
  expect(q.button("Remove React")).not.toBeInTheDocument();
});

test("exposes standalone TagRemove with an aria-label", () => {
  const removeButton = q.button("Remove Vue filter");
  expect(removeButton).not.toHaveAttribute("aria-hidden", "true");
  expect(removeButton).toHaveAttribute("aria-label", "Remove Vue filter");
  expect(removeButton).toHaveTextContent("x");
  expect(q.button("Remove Vue")).not.toBeInTheDocument();
});

test("does not render a default icon outside a Tag", () => {
  const removeButton = q.button.ensure("Remove Angular filter");
  expect(removeButton).not.toHaveAttribute("aria-hidden", "true");
  expect(removeButton).toHaveAttribute("aria-label", "Remove Angular filter");
  expect(removeButton.querySelector("svg")).not.toBeInTheDocument();
});

test("preserves a standalone render element name", () => {
  const removeButton = q.button("Remove Svelte filter");
  expect(removeButton).not.toHaveAttribute("aria-hidden", "true");
  expect(removeButton).not.toHaveAttribute("aria-label");
  expect(q.button("Remove Svelte")).not.toBeInTheDocument();
});

test("preserves a standalone root labelledby name", () => {
  const removeButton = q.button("Remove Solid filter");
  expect(removeButton).not.toHaveAttribute("aria-hidden", "true");
  expect(removeButton).not.toHaveAttribute("aria-label");
  expect(removeButton).toHaveAttribute("aria-labelledby", "solid-label");
  expect(removeButton).toHaveTextContent("x");
  expect(q.button("Remove Solid")).not.toBeInTheDocument();
});
