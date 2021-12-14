import {
  click,
  getByRole,
  getByText,
  press,
  render,
  type,
} from "ariakit-test-utils";
import Example from ".";

test("show on click", async () => {
  render(<Example />);
  expect(getByRole("listbox", { hidden: true })).not.toBeVisible();
  await click(getByRole("combobox"));
  expect(getByRole("listbox")).toBeVisible();
  expect(getByRole("option", { name: "🍎 Apple" })).not.toHaveFocus();
});

test("show on label click", async () => {
  render(<Example />);
  expect(getByRole("listbox", { hidden: true })).not.toBeVisible();
  await click(getByText("Your favorite fruit"));
  expect(getByRole("listbox")).toBeVisible();
  expect(getByRole("option", { name: "🍎 Apple" })).not.toHaveFocus();
});

test("show on arrow down key", async () => {
  render(<Example />);
  await press.Tab();
  expect(getByRole("listbox", { hidden: true })).not.toBeVisible();
  await press.ArrowDown();
  expect(getByRole("listbox")).toBeVisible();
  expect(getByRole("option", { name: "🍎 Apple" })).not.toHaveFocus();
});

test("show on arrow up key", async () => {
  render(<Example />);
  await press.Tab();
  expect(getByRole("listbox", { hidden: true })).not.toBeVisible();
  await press.ArrowUp();
  expect(getByRole("listbox")).toBeVisible();
  expect(getByRole("option", { name: "🍉 Watermelon" })).not.toHaveFocus();
});

test("show on change", async () => {
  render(<Example />);
  await press.Tab();
  expect(getByRole("listbox", { hidden: true })).not.toBeVisible();
  await type("a");
  expect(getByRole("listbox")).toBeVisible();
  expect(getByRole("option", { name: "🍎 Apple" })).not.toHaveFocus();
});

test("navigate through items with keyboard", async () => {
  render(<Example />);
  await press.Tab();
  await press.ArrowDown();
  await press.ArrowDown();
  expect(getByRole("option", { name: "🍎 Apple" })).toHaveFocus();
  await press.ArrowDown();
  expect(getByRole("option", { name: "🍇 Grape" })).toHaveFocus();
  await press.ArrowDown();
  expect(getByRole("option", { name: "🍊 Orange" })).toHaveFocus();
});

test("type", async () => {
  render(<Example />);
  await press.Tab();
  await type("a");
  await press.ArrowDown();
  expect(getByRole("option", { name: "🍎 Apple" })).toHaveFocus();
  await press.ArrowLeft();
  expect(getByRole("option", { name: "🍎 Apple" })).toHaveFocus();
  await type("b");
  expect(getByRole("combobox")).toHaveValue("ba");
  expect(getByRole("option", { name: "🍉 Watermelon" })).not.toHaveFocus();
});

test("set value and hide on item click with mouse", async () => {
  render(<Example />);
  await click(getByRole("combobox"));
  expect(getByRole("combobox")).toHaveValue("");
  await click(getByRole("option", { name: "🍊 Orange" }));
  expect(getByRole("combobox")).toHaveFocus();
  expect(getByRole("combobox")).toHaveValue("Orange");
  expect(getByRole("listbox", { hidden: true })).not.toBeVisible();
});

test("set value and hide on item click with keyboard", async () => {
  render(<Example />);
  await press.Tab();
  await press.ArrowDown();
  await press.ArrowDown();
  await press.ArrowDown();
  expect(getByRole("combobox")).toHaveValue("");
  await press.Enter();
  expect(getByRole("combobox")).toHaveFocus();
  expect(getByRole("combobox")).toHaveValue("Grape");
  expect(getByRole("listbox", { hidden: true })).not.toBeVisible();
});

test("do not set value and hide by pressing space", async () => {
  render(<Example />);
  await press.Tab();
  await press.ArrowDown();
  await press.ArrowDown();
  await press.ArrowDown();
  expect(getByRole("combobox")).toHaveValue("");
  await type(" ");
  expect(getByRole("combobox")).toHaveFocus();
  expect(getByRole("combobox")).toHaveValue(" ");
  expect(getByRole("option", { name: "🍊 Orange" })).not.toHaveFocus();
  expect(getByRole("listbox")).toBeVisible();
});

test("hide listbox by pressing escape", async () => {
  render(<Example />);
  await click(getByRole("combobox"));
  expect(getByRole("listbox")).toBeVisible();
  await press.Escape();
  expect(getByRole("listbox", { hidden: true })).not.toBeVisible();
  expect(getByRole("combobox")).toHaveFocus();
});

test("hide listbox by clicking outside", async () => {
  render(<Example />);
  await click(getByRole("combobox"));
  expect(getByRole("listbox")).toBeVisible();
  await click(document.body);
  expect(getByRole("listbox", { hidden: true })).not.toBeVisible();
  expect(getByRole("combobox")).not.toHaveFocus();
});

test("re-open listbox when deleting content", async () => {
  render(<Example />);
  await press.Tab();
  await type("a");
  expect(getByRole("listbox")).toBeVisible();
  await press.Escape();
  expect(getByRole("listbox", { hidden: true })).not.toBeVisible();
  await type("\b");
  expect(getByRole("listbox")).toBeVisible();
});
