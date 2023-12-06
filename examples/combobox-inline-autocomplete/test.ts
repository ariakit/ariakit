import { click, press, q, type } from "@ariakit/test";

test("autocomplete on arrow down key", async () => {
  await press.Tab();
  expect(q.listbox()).not.toBeInTheDocument();
  expect(q.combobox("Your favorite fruit")).toHaveFocus();
  await type("a");
  expect(q.listbox()).toBeVisible();
  await press.ArrowDown();
  expect(q.combobox("Your favorite fruit")).toHaveValue("Apple");
});

test("autocomplete on arrow up key", async () => {
  await press.Tab();
  expect(q.listbox()).not.toBeInTheDocument();
  expect(q.combobox("Your favorite fruit")).toHaveFocus();
  await type("w");
  expect(q.listbox()).toBeVisible();
  await press.ArrowUp();
  expect(q.combobox("Your favorite fruit")).toHaveValue("Watermelon");
});

test("clicking on combobox input makes the inline autocomplete the value", async () => {
  await press.Tab();
  await type("w");
  await press.ArrowUp();
  await click(q.combobox("Your favorite fruit"));
  expect(q.combobox("Your favorite fruit")).toHaveValue("Watermelon");
});
