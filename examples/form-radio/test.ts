import { click, press, q } from "@ariakit/test";

const spyOnAlert = () => vi.spyOn(window, "alert").mockImplementation(() => {});

let alert = spyOnAlert();

beforeEach(() => {
  alert = spyOnAlert();
  return () => alert.mockClear();
});

test("focus on the first radio button by tabbing", async () => {
  expect(q.radio("Red")).not.toHaveFocus();
  expect(q.radio("Green")).not.toHaveFocus();
  expect(q.radio("Blue")).not.toHaveFocus();
  await press.Tab();
  expect(q.radio("Red")).toHaveFocus();
});

test("show error on blur", async () => {
  await press.Tab();
  expect(q.text("Please select a color.")).not.toBeInTheDocument();
  await press.Tab();
  expect(q.button("Submit")).toHaveFocus();
  expect(q.text("Please select a color.")).toBeInTheDocument();
});

test("show error on submit", async () => {
  expect(q.text("Please select a color.")).not.toBeInTheDocument();
  await click(q.button("Submit"));
  expect(q.text("Please select a color.")).toBeInTheDocument();
});

test("focus on radio with error on submit", async () => {
  await click(q.button("Submit"));
  expect(q.radio("Red")).toHaveFocus();
});

test("fix error on change", async () => {
  await press.Tab();
  expect(q.radio("Red")).toHaveFocus();
  await press.Tab();
  expect(q.button("Submit")).toHaveFocus();
  await press.ShiftTab();
  expect(q.radio("Blue")).toHaveFocus();
  expect(q.text("Please select a color.")).toBeInTheDocument();
  await press.Space();
  expect(q.text("Please select a color.")).not.toBeInTheDocument();
});

test("submit form", async () => {
  await click(q.radio("Green"));
  await click(q.button("Submit"));
  expect(alert).toHaveBeenCalledWith(JSON.stringify({ color: "green" }));
});

test("reset form on submit", async () => {
  await press.Tab();
  await press.Space();
  await press.Tab();
  await press.Enter();
  expect(q.radio("Red")).not.toBeChecked();
  expect(q.radio("Green")).not.toBeChecked();
  expect(q.radio("Blue")).not.toBeChecked();
});
