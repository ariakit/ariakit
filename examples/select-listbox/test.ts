import { findByRole, press } from "@ariakit/test";

const getListbox = () => findByRole("listbox");
const getItem = (name: string) => findByRole("option", { name });

test("tab to listbox", async () => {
  expect(await getListbox()).not.toHaveFocus();
  await press.Tab();
  expect(await getListbox()).toHaveFocus();
  expect(await getItem("Apple")).not.toHaveFocus();
});

test("move through items with arrow keys", async () => {
  await press.Tab();
  await press.ArrowDown();
  expect(await getListbox()).toHaveFocus();
  expect(await getItem("Apple")).toHaveFocus();
  expect(await getItem("Apple")).toHaveAttribute("data-active-item", "");
  expect(await getItem("Apple")).toHaveAttribute("data-focus-visible", "");
  expect(await getItem("Apple")).toHaveAttribute("aria-selected", "true");
  await press.ArrowDown();
  expect(await getListbox()).toHaveFocus();
  expect(await getItem("Banana")).toHaveFocus();
  expect(await getItem("Banana")).toHaveAttribute("data-active-item", "");
  expect(await getItem("Banana")).toHaveAttribute("data-focus-visible", "");
  expect(await getItem("Banana")).toHaveAttribute("aria-selected", "false");
});

test("select item with keyboard", async () => {
  await press.Tab();
  await press.ArrowDown();
  await press.ArrowDown();
  await press.ArrowDown();
  await press.Enter();
  expect(await getListbox()).toHaveFocus();
  expect(await getItem("Orange")).toHaveFocus();
  expect(await getItem("Orange")).toHaveAttribute("data-active-item", "");
  expect(await getItem("Orange")).toHaveAttribute("data-focus-visible", "");
  expect(await getItem("Orange")).toHaveAttribute("aria-selected", "true");
  await press.Home();
  await press.Space();
  expect(await getListbox()).toHaveFocus();
  expect(await getItem("Apple")).toHaveFocus();
  expect(await getItem("Apple")).toHaveAttribute("data-active-item", "");
  expect(await getItem("Apple")).toHaveAttribute("data-focus-visible", "");
  expect(await getItem("Apple")).toHaveAttribute("aria-selected", "true");
});
