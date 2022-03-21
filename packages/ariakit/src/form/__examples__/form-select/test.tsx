import {
  click,
  getByRole,
  press,
  queryByText,
  render,
  type,
} from "ariakit-test-utils";
import { axe } from "jest-axe";
import Example from ".";

const getInput = (name: string) => getByRole("textbox", { name });
const getError = () => queryByText("Constraints not satisfied");

const spyOnAlert = () =>
  jest.spyOn(window, "alert").mockImplementation(() => {});

let alert = spyOnAlert();

beforeEach(() => {
  alert = spyOnAlert();
});

afterEach(() => {
  alert.mockClear();
});

test("markup", () => {
  const { container } = render(<Example />);
  expect(container).toMatchInlineSnapshot(`
    <div>
      <form
        class="form"
        novalidate=""
      >
        <div
          class="field"
        >
          <label
            for="r:1"
            id="r:0"
          >
            Name
          </label>
          <input
            aria-describedby="r:2"
            aria-labelledby="r:0"
            id="r:1"
            name="name"
            placeholder="John Doe"
            required=""
            value=""
          />
          <div
            class="error"
            id="r:2"
            role="alert"
          />
        </div>
        <button
          class="button"
          data-command=""
          type="submit"
        >
          Submit
        </button>
        <button
          class="button secondary"
          data-command=""
          type="reset"
        >
          Reset
        </button>
      </form>
    </div>
  `);
});

test("a11y", async () => {
  const { container } = render(<Example />);
  expect(await axe(container)).toHaveNoViolations();
});

test("focus on the first input by tabbing", async () => {
  render(<Example />);
  expect(getInput("Name")).not.toHaveFocus();
  await press.Tab();
  expect(getInput("Name")).toHaveFocus();
});

test("show error on blur", async () => {
  render(<Example />);
  expect(getError()).not.toBeInTheDocument();
  await press.Tab();
  await press.Tab();
  expect(getError()).toBeInTheDocument();
});

test("show error on submit", async () => {
  render(<Example />);
  await press.Tab();
  expect(getError()).not.toBeInTheDocument();
  await press.Enter();
  expect(getError()).toBeInTheDocument();
});

test("focus on input with error on submit", async () => {
  render(<Example />);
  await click(getByRole("button", { name: "Submit" }));
  expect(getInput("Name")).toHaveFocus();
});

test("fix error on change", async () => {
  render(<Example />);
  await press.Tab();
  await press.Tab();
  await press.ShiftTab();
  expect(getError()).toBeInTheDocument();
  await type("John");
  expect(getError()).not.toBeInTheDocument();
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
  await press.Enter();
  expect(alert).toHaveBeenCalledWith(JSON.stringify({ name: "John" }));
});

test("reset form on submit", async () => {
  render(<Example />);
  await press.Tab();
  await type("John");
  await press.Enter();
  expect(getInput("Name")).toHaveValue("");
});
