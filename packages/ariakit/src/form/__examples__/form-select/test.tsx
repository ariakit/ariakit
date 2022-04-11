import {
  click,
  getByRole,
  getByText,
  press,
  queryByText,
  render,
} from "ariakit-test-utils";
import Example from ".";

const getLabel = () => getByText("Favorite fruit");
const getSelect = () => getByRole("combobox", { name: "Favorite fruit" });
const getList = () => getByRole("listbox", { hidden: true });
const getOption = (name: string) => getByRole("option", { name });
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

test("click on label", async () => {
  render(<Example />);
  await click(getLabel());
  expect(getSelect()).toHaveFocus();
  expect(getList()).not.toBeVisible();
});

test("show error", async () => {
  render(<Example />);
  await click(getSelect());
  expect(getError()).not.toBeInTheDocument();
  await press.Escape();
  expect(getError()).toBeInTheDocument();
  await press.Space();
  await press.ArrowDown();
  await press.Enter();
  expect(getError()).not.toBeInTheDocument();
  await press.Enter();
  await click(getOption("Select an item"));
  expect(getError()).toBeInTheDocument();
});

test("submit failed", async () => {
  render(<Example />);
  await press.Tab();
  await press.Tab();
  expect(getError()).not.toBeInTheDocument();
  await press.Enter();
  expect(getError()).toBeInTheDocument();
  expect(getSelect()).toHaveFocus();
  expect(getList()).not.toBeVisible();
});

test("submit succeed", async () => {
  render(<Example />);
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
      fruit: "Banana",
    })
  );
  // Reset on submit
  expect(getSelect()).toHaveTextContent("Select an item");
});
