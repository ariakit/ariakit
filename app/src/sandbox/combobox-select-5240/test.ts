import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/pull/5240#discussion_r3973490977
test("displays zero counts instead of the selected value", async () => {
  expect(q.combobox("Unread messages")).toHaveTextContent("0");
  expect(q.combobox("Open issues")).toHaveTextContent("0");
  await click(q.combobox("Open issues"));
  expect(q.option("0")).toBeVisible();
  await click(q.option("0"));
  expect(q.listbox.maybe()).not.toBeInTheDocument();
});

// https://github.com/ariakit/ariakit/pull/5240#discussion_r3973273374
test("opens and selects with a supplied store", async () => {
  const select = q.combobox("Fruit");
  expect(select).toHaveTextContent("Apple");
  await click(select);
  expect(q.option("Orange")).toBeVisible();
  await click(q.option("Orange"));
  expect(select).toHaveTextContent("Orange");
  expect(q.text("Selected fruit: Orange")).toBeVisible();
  expect(q.listbox.maybe()).not.toBeInTheDocument();
});
