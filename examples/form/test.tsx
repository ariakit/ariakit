import {
  click,
  getByRole,
  press,
  queryAllByText,
  render,
  type,
} from "@ariakit/test";
import Example from ".";

const getInput = (name: string) => getByRole("textbox", { name });
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

test("focus on the first input by tabbing", async () => {
  render(<Example />);
  expect(getInput("Name")).not.toHaveFocus();
  await press.Tab();
  expect(getInput("Name")).toHaveFocus();
});

test("show error on blur", async () => {
  render(<Example />);
  expect(getErrors()).toHaveLength(0);
  await press.Tab();
  await press.Tab();
  expect(getErrors()).toHaveLength(1);
  await press.Tab();
  expect(getErrors()).toHaveLength(2);
});

test("show error on submit", async () => {
  render(<Example />);
  await press.Tab();
  expect(getErrors()).toHaveLength(0);
  await press.Enter();
  expect(getErrors()).toHaveLength(2);
});

test("focus on input with error on submit", async () => {
  render(<Example />);
  await click(getByRole("button", { name: "Add" }));
  expect(getInput("Name")).toHaveFocus();
});

test("fix error on change", async () => {
  render(<Example />);
  await press.Tab();
  await press.Tab();
  await press.ShiftTab();
  expect(getErrors()).toHaveLength(2);
  await type("John");
  expect(getErrors()).toHaveLength(1);
});

test("reset form on reset", async () => {
  render(<Example />);
  await press.Tab();
  await type("John");
  await press.Tab();
  await press.Tab();
  expect(getByRole("button", { name: "Reset" })).toHaveFocus();
  await press.Enter();
  expect(getInput("Name")).toHaveValue("");
});

test("submit form", async () => {
  render(<Example />);
  await press.Tab();
  await type("John");
  await press.Tab();
  await type("john@example.com");
  await press.Enter();
  expect(alert).toHaveBeenCalledWith(
    JSON.stringify({ name: "John", email: "john@example.com" })
  );
});

test("reset form on submit", async () => {
  render(<Example />);
  await press.Tab();
  await type("John");
  await press.Tab();
  await type("john@example.com");
  await press.Enter();
  expect(getInput("Name")).toHaveValue("");
  expect(getInput("Email")).toHaveValue("");
});
