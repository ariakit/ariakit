import { click, getByRole, hover, press, render, type } from "ariakit-test";
import { axe } from "jest-axe";
import Example from ".";

const getCombobox = () => getByRole("combobox");
const getOption = (name: string) => getByRole("option", { name });

function getSelectionValue(element: Element) {
  const input = element as HTMLInputElement;
  const { selectionStart, selectionEnd } = input;
  const selectionValue = input.value.slice(selectionStart!, selectionEnd!);
  return selectionValue;
}

test("a11y", async () => {
  const { container } = render(<Example />);
  expect(await axe(container)).toHaveNoViolations();
});

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
  expect(getCombobox()).toHaveValue("grape");
  await hover(getOption("Gelato"));
  expect(getCombobox()).toHaveValue("g");
});
