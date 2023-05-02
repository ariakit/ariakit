import { click, getByRole, press, queryByText } from "@ariakit/test";

const getSubmit = () => getByRole("button", { name: "Submit" });
const getRadio = (name: string) => getByRole("radio", { name });
const getError = () => queryByText("Please select a color.");

const spyOnAlert = () => vi.spyOn(window, "alert").mockImplementation(() => {});

let alert = spyOnAlert();

beforeEach(() => {
  alert = spyOnAlert();
  return () => alert.mockClear();
});

test("focus on the first radio button by tabbing", async () => {
  expect(getRadio("Red")).not.toHaveFocus();
  expect(getRadio("Green")).not.toHaveFocus();
  expect(getRadio("Blue")).not.toHaveFocus();
  await press.Tab();
  expect(getRadio("Red")).toHaveFocus();
});

test("show error on blur", async () => {
  await press.Tab();
  expect(getError()).not.toBeInTheDocument();
  await press.Tab();
  expect(getSubmit()).toHaveFocus();
  expect(getError()).toBeInTheDocument();
});

test("show error on submit", async () => {
  expect(getError()).not.toBeInTheDocument();
  await click(getSubmit());
  expect(getError()).toBeInTheDocument();
});

test("focus on radio with error on submit", async () => {
  await click(getSubmit());
  expect(getRadio("Red")).toHaveFocus();
});

test("fix error on change", async () => {
  await press.Tab();
  expect(getRadio("Red")).toHaveFocus();
  await press.Tab();
  expect(getSubmit()).toHaveFocus();
  await press.ShiftTab();
  expect(getRadio("Blue")).toHaveFocus();
  expect(getError()).toBeInTheDocument();
  await press.Space();
  expect(getError()).not.toBeInTheDocument();
});

test("submit form", async () => {
  await click(getRadio("Green"));
  await click(getSubmit());
  expect(alert).toHaveBeenCalledWith(JSON.stringify({ color: "green" }));
});

test("reset form on submit", async () => {
  await press.Tab();
  await press.Space();
  await press.Tab();
  await press.Enter();
  expect(getRadio("Red")).not.toBeChecked();
  expect(getRadio("Green")).not.toBeChecked();
  expect(getRadio("Blue")).not.toBeChecked();
});
