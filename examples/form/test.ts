import {
  expect,
  test,
  vi,
  click,
  press,
  q,
  type,
} from "../../browser-test-utils.ts";

const errors = () => q.alert.all().filter((element) => element.textContent);
const spyOnAlert = () => vi.spyOn(window, "alert").mockImplementation(() => {});

test("focus on the first input by tabbing", async () => {
  expect(q.textbox("Name")).not.toHaveFocus();
  await press.Tab();
  expect(q.textbox("Name")).toHaveFocus();
});

test("show error on blur", async () => {
  expect(errors()).toHaveLength(0);
  await press.Tab();
  await press.Tab();
  expect(errors()).toHaveLength(1);
  await press.Tab();
  expect(errors()).toHaveLength(2);
});

test("show error on submit", async () => {
  await press.Tab();
  expect(errors()).toHaveLength(0);
  await press.Enter();
  expect(errors()).toHaveLength(2);
});

test("focus on input with error on submit", async () => {
  await click(q.button("Add"));
  expect(q.textbox("Name")).toHaveFocus();
});

test("fix error on change", async () => {
  await press.Tab();
  await press.Tab();
  await press.ShiftTab();
  expect(errors()).toHaveLength(2);
  await type("John");
  expect(errors()).toHaveLength(1);
});

test("reset form on reset", async () => {
  await press.Tab();
  await type("John");
  await press.Tab();
  await press.Tab();
  expect(q.button("Reset")).toHaveFocus();
  await press.Enter();
  expect(q.textbox("Name")).toHaveValue("");
});

test("submit form", async () => {
  using alert = spyOnAlert();
  await press.Tab();
  await type("John");
  await press.Tab();
  await type("john@example.com");
  await press.Enter();
  expect(alert).toHaveBeenCalledWith(
    JSON.stringify({ name: "John", email: "john@example.com" }),
  );
});

test("reset form on submit", async () => {
  using alert = spyOnAlert();
  await press.Tab();
  await type("John");
  await press.Tab();
  await type("john@example.com");
  await press.Enter();
  expect(alert).toHaveBeenCalledTimes(1);
  expect(q.textbox("Name")).toHaveValue("");
  expect(q.textbox("Email")).toHaveValue("");
});
