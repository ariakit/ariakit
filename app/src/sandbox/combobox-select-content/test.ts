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

// https://github.com/ariakit/ariakit/pull/5240#discussion_r3974549543
test("falls back from false labels and keeps conditional options named", async () => {
  const button = q.combobox("Status filter");
  expect(button).toHaveTextContent("Open");
  expect(q.combobox("Status summary")).toHaveTextContent("0Summary");
  await click(button);
  await click(q.option("Closed"));
  expect(button).toHaveTextContent("Closed");
  await click(q.checkbox("Show status labels"));
  expect(button).toHaveTextContent("Custom status");
  await click(button);
  expect(q.option("Closed status")).toBeVisible();
});

// https://github.com/ariakit/ariakit/pull/5240#discussion_r3974549543
test("omits false icon slots and preserves zero icons", async () => {
  const button = q.combobox("Status filter");
  expect(button.children).toHaveLength(1);
  await click(button);
  const options = q.option.all();
  expect(options[0]?.children).toHaveLength(1);
  expect(options[1]?.children).toHaveLength(1);
  expect(q.option(/^0\s*No activity$/)).toBeVisible();
});

// https://github.com/ariakit/ariakit/pull/5240#discussion_r3974549543
test("preserves intentional empty strings", async () => {
  expect(q.combobox("Blank display")).toHaveTextContent(/^$/);
  expect(q.combobox("Blank summary")).toHaveTextContent(/^$/);
  await click(q.combobox("Status filter"));
  expect(q.option("Blank status")).toHaveTextContent(/^$/);
});
