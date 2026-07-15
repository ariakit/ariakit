import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// Reproduces https://github.com/ariakit/ariakit/issues/5238
test("keeps an initially open inline nested dialog in front", async () => {
  expect(document.querySelectorAll("[data-dialog]")).toHaveLength(2);
  expect(q.dialog("Parent")).not.toBeInTheDocument();
  expect(q.dialog("Child")).toBeVisible();
  await click(q.button("Interact with child"));
  expect(q.status("Child count")).toHaveTextContent("Child interactions: 1");

  await click(q.button("Move child to portal"));
  expect(q.dialog("Parent")).not.toBeInTheDocument();
  expect(q.dialog("Child")).toBeVisible();
  await click(q.button("Interact with child"));
  expect(q.status("Child count")).toHaveTextContent("Child interactions: 2");

  await click(q.button("Close child"));
  expect(q.dialog.hidden("Child")).not.toBeInTheDocument();
  expect(q.dialog("Parent")).toBeVisible();
  await click(q.button("Interact with parent"));
  expect(q.status("Parent count")).toHaveTextContent("Parent interactions: 1");

  await click(q.button("Remount with portaled child"));
  expect(q.dialog("Parent")).not.toBeInTheDocument();
  expect(q.dialog("Child")).toBeVisible();
  await click(q.button("Interact with child"));
  expect(q.status("Child count")).toHaveTextContent("Child interactions: 3");
});

test("keeps a portaled child in front when its parent reopens", async () => {
  await click(q.button("Move child to portal"));
  await click(q.button("Hide parent"));
  expect(q.dialog("Parent")).not.toBeInTheDocument();
  expect(q.dialog("Child")).toBeVisible();

  await click(q.button("Show parent"));
  expect(q.dialog("Parent")).not.toBeInTheDocument();
  expect(q.dialog("Child")).toBeVisible();
  await click(q.button("Interact with child"));
  expect(q.status("Child count")).toHaveTextContent("Child interactions: 1");
});

test("keeps a later sibling in front of a portaled nested branch", async () => {
  await click(q.button("Remount portaled branch with sibling"));

  expect(q.dialog("Parent")).not.toBeInTheDocument();
  expect(q.dialog("Child")).not.toBeInTheDocument();
  expect(q.dialog("Sibling")).toBeVisible();
  await click(q.button("Interact with sibling"));
  expect(q.status("Sibling count")).toHaveTextContent(
    "Sibling interactions: 1",
  );
});
