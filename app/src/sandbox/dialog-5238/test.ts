import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// Reproduces https://github.com/ariakit/ariakit/issues/5238
test("keeps the frontmost initially open sibling dialog interactive", async () => {
  expect(q.dialog.all.hidden()).toHaveLength(2);
  expect(q.dialog.hidden("Apples")).toBeVisible();
  expect(q.dialog.hidden("Oranges")).toBeVisible();
  expect(q.dialog("Oranges")).not.toBeInTheDocument();
  expect(q.dialog("Apples")).toBeVisible();
  await click(q.button("Eat apple"));
  expect(q.status("Apple count")).toHaveTextContent("Apples eaten: 1");

  await click(q.button("Close apples"));
  expect(q.dialog("Apples")).not.toBeInTheDocument();
  expect(q.dialog("Oranges")).toBeVisible();
  await click(q.button("Eat orange"));
  expect(q.status("Orange count")).toHaveTextContent("Oranges eaten: 1");
});
