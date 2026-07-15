import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// Reproduces https://github.com/ariakit/ariakit/issues/5238
test("keeps an initially open inline nested dialog in front", async () => {
  expect(document.querySelectorAll("[data-dialog]")).toHaveLength(2);
  expect(q.dialog("Parent")).not.toBeInTheDocument();
  expect(q.dialog("Child")).toBeVisible();
  await click(q.button("Interact with child"));
  expect(q.status("Child count")).toHaveTextContent("Child interactions: 1");

  await click(q.button("Close child"));
  expect(q.dialog.hidden("Child")).not.toBeInTheDocument();
  expect(q.dialog("Parent")).toBeVisible();
  await click(q.button("Interact with parent"));
  expect(q.status("Parent count")).toHaveTextContent("Parent interactions: 1");
});
