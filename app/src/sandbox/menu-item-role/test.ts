import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("updates item roles with the rendered menu", async () => {
  await expect.poll(q.menuitem.lazy("Layout item")).toBeVisible();
  expect(q.treeitem("Layout item")).not.toBeInTheDocument();
  await expect.poll(q.option.lazy("Mismatched item")).toBeVisible();
  expect(q.menuitem("Reapply item")).toBeVisible();

  await click(q.button("Actions"));
  expect(q.menuitem("Edit")).toBeVisible();

  await click(q.button("Use listbox role"));

  await expect.poll(q.option.lazy("Edit")).toBeVisible();
  expect(q.menuitem("Edit")).not.toBeInTheDocument();

  await click(q.button("Use tree role"));

  await expect.poll(q.treeitem.lazy("Edit")).toBeVisible();
  expect(q.option("Edit")).not.toBeInTheDocument();

  await click(q.button("Remove role"));

  await expect.poll(q.menuitem.lazy("Edit")).toBeVisible();
  expect(q.treeitem("Edit")).not.toBeInTheDocument();

  await click(q.button("Hook menu"));

  await expect.poll(q.option.lazy("Hook item")).toBeVisible();
});
