import { click, getByRole, hover, press, render, type } from "@ariakit/test";
import Example from "./index.jsx";

const getCombobox = () => getByRole("combobox");
const getOption = (name: string) => getByRole("option", { name });

function getSelectionValue(element: Element) {
  const input = element as HTMLInputElement;
  const { selectionStart, selectionEnd } = input;
  const selectionValue = input.value.slice(selectionStart!, selectionEnd!);
  return selectionValue;
}

test("auto select with inline autocomplete on typing", async () => {
  render(<Example />);
  await press.Tab();
  await type("a");
  expect(getCombobox()).toHaveValue("apple");
  expect(getSelectionValue(getCombobox())).toBe("pple");
  await press.ArrowDown();
  expect(getCombobox()).toHaveValue("Avocado");
  expect(getSelectionValue(getCombobox())).toBe("");
  await press.ArrowUp();
  expect(getCombobox()).toHaveValue("apple");
  expect(getSelectionValue(getCombobox())).toBe("pple");
  await type("e");
  expect(getCombobox()).toHaveValue("ae");
  expect(getSelectionValue(getCombobox())).toBe("");
  await type("\b\bv");
  expect(getCombobox()).toHaveValue("vodka");
  expect(getSelectionValue(getCombobox())).toBe("odka");
  await type("\bo");
  expect(getCombobox()).toHaveValue("vodka");
  expect(getSelectionValue(getCombobox())).toBe("dka");
});

test("auto select with inline autocomplete on arrow down", async () => {
  render(<Example />);
  await press.Tab();
  await press.ArrowDown();
  await press.ArrowDown();
  expect(getCombobox()).toHaveValue("Apple");
  expect(getSelectionValue(getCombobox())).toBe("Apple");
  await press.ArrowDown();
  expect(getCombobox()).toHaveValue("Avocado");
  expect(getSelectionValue(getCombobox())).toBe("");
  await press.ArrowUp();
  expect(getCombobox()).toHaveValue("Apple");
});

test("auto select with inline autocomplete on typing + arrow down", async () => {
  render(<Example />);
  await press.Tab();
  await type("av");
  expect(getCombobox()).toHaveValue("avocado");
  expect(getSelectionValue(getCombobox())).toBe("ocado");
  await type("\b");
  expect(getCombobox()).toHaveValue("av");
  expect(getOption("Avocado")).toHaveFocus();
  expect(getSelectionValue(getCombobox())).toBe("");
  await type("\b");
  expect(getCombobox()).toHaveValue("a");
  expect(getOption("Apple")).toHaveFocus();
  expect(getSelectionValue(getCombobox())).toBe("");
  await press.ArrowDown();
  expect(getCombobox()).toHaveValue("Avocado");
  expect(getOption("Avocado")).toHaveFocus();
  expect(getSelectionValue(getCombobox())).toBe("");
  for (const _ of "Avocado") {
    await press.ArrowLeft(null, { shiftKey: true });
  }
  await type("p");
  expect(getCombobox()).toHaveValue("papaya");
  expect(getOption("Papaya")).toHaveFocus();
  expect(getSelectionValue(getCombobox())).toBe("apaya");
  await type("\b");
  await press.ArrowLeft();
  await type("a");
  expect(getCombobox()).toHaveValue("ap");
  expect(getOption("Apple")).toHaveFocus();
  expect(getSelectionValue(getCombobox())).toBe("");
  await press.ArrowRight();
  await type("p");
  expect(getCombobox()).toHaveValue("apple");
  expect(getOption("Apple")).toHaveFocus();
  expect(getSelectionValue(getCombobox())).toBe("le");
});

test("blur input after autocomplete", async () => {
  render(<Example />);
  await press.Tab();
  await type("a");
  expect(getCombobox()).toHaveValue("apple");
  await press.ArrowDown();
  expect(getCombobox()).toHaveValue("Avocado");
  await click(document.body);
  await click(document.body);
  expect(getCombobox()).toHaveValue("Avocado");
});

test("autocomplete on focus on hover", async () => {
  render(<Example />);
  await click(getCombobox());
  await type("g");
  expect(getCombobox()).toHaveValue("gelato");
  await hover(getOption("Pudding"));
  expect(getCombobox()).toHaveValue("g");
});
