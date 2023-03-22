import {
  click,
  getByRole,
  getByText,
  press,
  queryAllByText,
  render,
  type,
} from "@ariakit/test";
import Example from "./index.jsx";

const getSubmit = () => getByRole("button", { name: "Submit" });
const getLabel = () => getByText("Favorite fruit");
const getSelect = () => getByRole("combobox", { name: "Favorite fruit" });
const getList = () => getByRole("listbox", { hidden: true });
const getOption = (name: string) => getByRole("option", { name });
const getErrors = () => queryAllByText("Constraints not satisfied");

const spyOnAlert = () =>
  jest.spyOn(window, "alert").mockImplementation(() => {});

let alert = spyOnAlert();

beforeEach(() => {
  alert = spyOnAlert();
});

afterEach(() => {
  alert.mockClear();
});

test("click on label", async () => {
  render(<Example />);
  await click(getLabel());
  expect(getSelect()).toHaveFocus();
  expect(getList()).not.toBeVisible();
});

test("show error on tabbing through select button", async () => {
  render(<Example />);
  await press.ShiftTab();
  await press.ShiftTab();
  expect(getSelect()).toHaveFocus();
  expect(getErrors()).toHaveLength(0);
  await press.Tab();
  expect(getErrors()).toHaveLength(1);
});

test("show error only on blur both the select button and the popover", async () => {
  render(<Example />);
  await click(getSelect());
  expect(getErrors()).toHaveLength(0);
  await press.Escape();
  expect(getErrors()).toHaveLength(0);
  await press.Space();
  await press.ArrowDown();
  await press.Enter();
  expect(getErrors()).toHaveLength(0);
  await press.Enter();
  await click(getOption("Select an item"));
  expect(getErrors()).toHaveLength(0);
  await press.Tab();
  expect(getErrors()).toHaveLength(1);
});

test("submit failed", async () => {
  render(<Example />);
  expect(getErrors()).toHaveLength(0);
  await press.Tab();
  await type("John");
  await click(getSubmit());
  expect(getErrors()).toHaveLength(1);
  expect(getSelect()).toHaveFocus();
  expect(getList()).not.toBeVisible();
});

test("submit succeed", async () => {
  render(<Example />);
  await press.Tab();
  await type("John");
  await click(getSelect());
  await click(getOption("Banana"));
  expect(alert).not.toHaveBeenCalled();
  await press.Enter();
  expect(getList()).toBeVisible();
  expect(alert).not.toHaveBeenCalled();
  await press.Escape();
  await press.Tab();
  await press.Enter();
  expect(alert).toHaveBeenCalledWith(
    JSON.stringify({
      name: "John",
      fruit: "Banana",
    })
  );
  // Reset on submit
  expect(getSelect()).toHaveTextContent("Select an item");
});
