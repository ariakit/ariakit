import { click, q, rightClick } from "@ariakit/test";
import { expect, test } from "vitest";

function getBackdrop(name: string) {
  const dialog = q.dialog.hidden(name);
  const selector = `[data-backdrop="${dialog?.id}"]`;
  return document.querySelector<HTMLElement>(selector);
}

// Reproduces https://github.com/ariakit/ariakit/issues/5238
test("keeps the frontmost initially open sibling dialog interactive", async () => {
  expect(q.dialog.hidden("Apples")).toBeVisible();
  expect(q.dialog.hidden("Oranges")).toBeVisible();
  expect(q.dialog("Apples")).toBeVisible();
  await click(q.button("Eat apple"));
  expect(q.status("Apple count")).toHaveTextContent("Apples eaten: 1");

  await rightClick(getBackdrop("Apples"));
  expect(q.dialog("Apples")).not.toBeInTheDocument();
  expect(document.querySelectorAll("[data-dialog]")).toHaveLength(1);
  expect(q.dialog("Oranges")).toBeVisible();
  await click(q.button("Eat orange"));
  expect(q.status("Orange count")).toHaveTextContent("Oranges eaten: 1");
});

// Reproduces the backdrop replacement case found while fixing #5238.
test("keeps the background open after replacing the foreground backdrop", async () => {
  const previousBackdrop = getBackdrop("Apples");
  previousBackdrop?.setAttribute("data-previous-backdrop", "");

  await click(q.button("Replace apple backdrop"));
  expect(document.querySelector("[data-previous-backdrop]")).toBeNull();

  const replacementBackdrop = document.querySelector<HTMLElement>(
    "[data-replacement-backdrop]",
  );
  await rightClick(replacementBackdrop);

  expect(q.dialog("Apples")).not.toBeInTheDocument();
  expect(document.querySelectorAll("[data-dialog]")).toHaveLength(1);
  expect(q.dialog("Oranges")).toBeVisible();
});

// Reproduces the dialog host replacement case found while fixing #5238.
test("preserves the stack order when replacing the background dialog", async () => {
  await click(q.button("Replace orange dialog"));

  expect(document.querySelector("[data-replacement-dialog]")).toBeVisible();
  expect(q.dialog("Apples")).toBeVisible();
  await click(q.button("Eat apple"));
  expect(q.status("Apple count")).toHaveTextContent("Apples eaten: 1");
});
