import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("renders the scroll buttons outside the tab list", () => {
  const list = q.tablist("Files");
  expect(q.button("Previous tabs")).toBeInTheDocument();
  expect(q.button("Next tabs")).toBeInTheDocument();
  expect(q.within(list).button.maybe("Previous tabs")).not.toBeInTheDocument();
  expect(q.within(list).button.maybe("Next tabs")).not.toBeInTheDocument();
});

test("copies the last file", async () => {
  await click(q.tab("todo-app.tsx"));
  await press.End();
  expect(q.tab("todos.json")).toHaveFocus();
  expect(q.tabpanel("todos.json")).toBeVisible();
  await click(q.button("Copy todos.json"));
  expect(await q.button.wait("Copied")).toBeInTheDocument();
  expect(await navigator.clipboard.readText()).toMatch(/^\[\n {2}\{ "id": "1"/);
});
