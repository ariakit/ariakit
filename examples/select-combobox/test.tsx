import {
  click,
  getByPlaceholderText,
  getByRole,
  press,
  render,
  type,
} from "@ariakit/test";
import Example from "./index.jsx";

const getSelect = () => getByRole("combobox", { name: "Favorite fruit" });
const getPopover = () => getByRole("dialog", { hidden: true });
const getCombobox = () => getByPlaceholderText("Search...");
const getOption = (name: string) => getByRole("option", { name });

test("show/hide on click", async () => {
  render(<Example />);
  expect(getPopover()).not.toBeVisible();
  await click(getSelect());
  expect(getPopover()).toBeVisible();
  expect(getCombobox()).toHaveFocus();
  expect(getOption("Apple")).toHaveFocus();
  await click(getSelect());
  expect(getPopover()).not.toBeVisible();
  expect(getSelect()).toHaveFocus();
});

test("show/hide on enter", async () => {
  render(<Example />);
  await press.Tab();
  await press.Enter();
  expect(getPopover()).toBeVisible();
  expect(getCombobox()).toHaveFocus();
  expect(getOption("Apple")).toHaveFocus();
  await press.ShiftTab();
  expect(getPopover()).toBeVisible();
  expect(getSelect()).toHaveFocus();
  await press.Enter();
  expect(getPopover()).not.toBeVisible();
  expect(getSelect()).toHaveFocus();
});

test("show/hide on space", async () => {
  render(<Example />);
  await press.Tab();
  await press.Space();
  expect(getPopover()).toBeVisible();
  expect(getCombobox()).toHaveFocus();
  expect(getOption("Apple")).toHaveFocus();
  await press.ShiftTab();
  expect(getPopover()).toBeVisible();
  expect(getSelect()).toHaveFocus();
  await press.Space();
  expect(getPopover()).not.toBeVisible();
  expect(getSelect()).toHaveFocus();
});

test("show on arrow down", async () => {
  render(<Example />);
  await press.Tab();
  await press.ArrowDown();
  expect(getPopover()).toBeVisible();
  expect(getCombobox()).toHaveFocus();
  expect(getOption("Apple")).toHaveFocus();
});

test("show on arrow up", async () => {
  render(<Example />);
  await press.Tab();
  await press.ArrowUp();
  expect(getPopover()).toBeVisible();
  expect(getCombobox()).toHaveFocus();
  expect(getOption("Apple")).toHaveFocus();
});

test("type on combobox", async () => {
  render(<Example />);
  await click(getSelect());
  await type("gr");
  expect(getCombobox()).toHaveValue("gr");
  expect(getOption("Grape")).toHaveFocus();
  await press.ArrowDown();
  await press.Enter();
  expect(getSelect()).toHaveTextContent("Green apple");
  await press.Enter();
  expect(getCombobox()).toHaveValue("");
  expect(getOption("Green apple")).toHaveFocus();
  await type("o");
  expect(getOption("Onion")).toHaveFocus();
});

test("select value after filtering", async () => {
  render(<Example />);
  await click(getSelect());
  await type("ba");
  await click(getOption("Banana"));
  expect(getSelect()).toHaveTextContent("Banana");
});
