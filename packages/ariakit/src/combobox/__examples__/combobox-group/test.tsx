import {
  click,
  getByRole,
  getByText,
  press,
  render,
  type,
} from "ariakit-test-utils";
import { axe } from "jest-axe";
import Example from ".";

const getCombobox = () => getByRole("combobox");

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

test("selection", async () => {
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
