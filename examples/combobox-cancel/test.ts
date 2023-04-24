import { click, fireEvent, getByRole, press, sleep, type } from "@ariakit/test";

const getCombobox = () => getByRole("combobox");
const getPopover = () => getByRole("listbox", { hidden: true });
const getCancelButton = () => getByRole("button", { name: "Clear input" });
const getOption = (name: string) => getByRole("option", { name });

test("clear input with mouse", async () => {
  await click(getCombobox());
  expect(getCombobox()).toHaveValue("");
  await click(getOption("Apple"));
  expect(getCombobox()).toHaveFocus();
  expect(getCombobox()).toHaveValue("Apple");
  await click(getCancelButton());
  expect(getCombobox()).toHaveValue("");
  expect(getCombobox()).toHaveFocus();
});

test("clear input with mouse after typing", async () => {
  await press.Tab();
  await type("a");
  expect(getCombobox()).toHaveValue("a");
  await click(getCancelButton());
  expect(getCombobox()).toHaveValue("");
  expect(getCombobox()).toHaveFocus();
  expect(getPopover()).toBeVisible();
});

test("clear input with keyboard (tab + enter)", async () => {
  await click(getCombobox());
  expect(getCombobox()).toHaveValue("");
  await click(getOption("Apple"));
  expect(getCombobox()).toHaveFocus();
  expect(getCombobox()).toHaveValue("Apple");
  await press.Tab();
  await press.Enter();
  expect(getCombobox()).toHaveValue("");
  expect(getCombobox()).toHaveFocus();
});

test("clear input with keyboard (tab + space)", async () => {
  await click(getCombobox());
  expect(getCombobox()).toHaveValue("");
  await click(getOption("Apple"));
  expect(getCombobox()).toHaveFocus();
  expect(getCombobox()).toHaveValue("Apple");
  await press.Tab();
  await press.Space();
  expect(getCombobox()).toHaveValue("");
  expect(getCombobox()).toHaveFocus();
});

test("clear input with keyboard after typing", async () => {
  await press.Tab();
  await type("a");
  expect(getCombobox()).toHaveValue("a");
  await press.Tab();
  await press.Enter();
  expect(getCombobox()).toHaveValue("");
  expect(getCombobox()).toHaveFocus();
  expect(getPopover()).toBeVisible();
});

test("https://github.com/ariakit/ariakit/issues/1652", async () => {
  await press.Tab();
  await type("a");
  await press.Tab();
  await press.Enter();
  expect(getOption("Apple")).not.toHaveFocus();
  await type("a");
  await click(getCancelButton());
  expect(getOption("Apple")).not.toHaveFocus();
});

test("composition text", async () => {
  fireEvent.compositionStart(getCombobox());
  await type("'", getCombobox(), { isComposing: true });
  expect(getOption("Apple")).not.toHaveFocus();
  await type("á", getCombobox(), { isComposing: true });
  fireEvent.compositionEnd(getCombobox());
  await sleep();
  expect(getCombobox()).toHaveValue("á");
  expect(getOption("Apple")).toHaveFocus();
});
