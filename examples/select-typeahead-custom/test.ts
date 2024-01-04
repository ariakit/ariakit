import { press, q, sleep, type } from "@ariakit/test";

test("typeahead open", async () => {
  await press.Tab();
  await press.Enter();
  await type("b");
  expect(q.option("🍌 Banana")).toHaveFocus();
  expect(q.option("🍎 Apple", { selected: true })).toBeVisible();
  expect(q.option("🍌 Banana", { selected: false })).toBeVisible();
  await sleep(600);
  await type("ora");
  expect(q.option("🍊 Orange")).toHaveFocus();
  expect(q.option("🍎 Apple", { selected: true })).toBeVisible();
  expect(q.option("🍊 Orange", { selected: false })).toBeVisible();
});

test("typeahead hidden", async () => {
  await press.Tab();
  await type("g");
  expect(q.combobox()).toHaveTextContent("Apple");
  expect(q.listbox()).not.toBeInTheDocument();
  await sleep(600);
  await type("ora");
  expect(q.combobox()).toHaveTextContent("Orange");
  expect(q.listbox()).not.toBeInTheDocument();
});
