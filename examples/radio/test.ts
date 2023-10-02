import { click, press, q } from "@ariakit/test";

test("check radio button on click", async () => {
  expect(q.labeled("apple")).toHaveAttribute("aria-checked", "false");
  expect(q.labeled("orange")).toHaveAttribute("aria-checked", "false");
  expect(q.labeled("watermelon")).toHaveAttribute("aria-checked", "false");
  await click(q.labeled("apple"));
  expect(q.labeled("apple")).toHaveAttribute("aria-checked", "true");
  expect(q.labeled("orange")).toHaveAttribute("aria-checked", "false");
  expect(q.labeled("watermelon")).toHaveAttribute("aria-checked", "false");
  await click(q.labeled("watermelon"));
  expect(q.labeled("apple")).toHaveAttribute("aria-checked", "false");
  expect(q.labeled("watermelon")).toHaveAttribute("aria-checked", "true");
});

test("tab", async () => {
  expect(q.labeled("apple")).not.toHaveFocus();
  expect(q.labeled("orange")).not.toHaveFocus();
  expect(q.labeled("watermelon")).not.toHaveFocus();
  await press.Tab();
  expect(q.labeled("apple")).toHaveFocus();
  expect(q.labeled("apple")).not.toBeChecked();
  expect(q.labeled("orange")).not.toHaveFocus();
  expect(q.labeled("watermelon")).not.toHaveFocus();
});

test("space", async () => {
  await press.Tab();
  expect(q.labeled("apple")).toHaveFocus();
  expect(q.labeled("apple")).not.toBeChecked();
  await press.Space();
  expect(q.labeled("apple")).toHaveFocus();
  expect(q.labeled("apple")).toBeChecked();
});

test("arrow right", async () => {
  await press.Tab();
  await press.ArrowRight();
  expect(q.labeled("orange")).toHaveFocus();
  expect(q.labeled("orange")).toBeChecked();
  await press.ArrowRight();
  expect(q.labeled("orange")).not.toBeChecked();
  expect(q.labeled("watermelon")).toBeChecked();
  expect(q.labeled("watermelon")).toHaveFocus();
});

test("arrow down", async () => {
  await press.Tab();
  await press.ArrowDown();
  expect(q.labeled("orange")).toHaveFocus();
  expect(q.labeled("orange")).toBeChecked();
  await press.ArrowDown();
  expect(q.labeled("orange")).not.toBeChecked();
  expect(q.labeled("watermelon")).toBeChecked();
  expect(q.labeled("watermelon")).toHaveFocus();
});

test("arrow left", async () => {
  await press.Tab();
  await press.ArrowLeft();
  expect(q.labeled("watermelon")).toHaveFocus();
  expect(q.labeled("watermelon")).toBeChecked();
  await press.ArrowLeft();
  expect(q.labeled("watermelon")).not.toBeChecked();
  expect(q.labeled("orange")).toBeChecked();
  expect(q.labeled("orange")).toHaveFocus();
});

test("arrow up", async () => {
  await press.Tab();
  await press.ArrowUp();
  expect(q.labeled("watermelon")).toHaveFocus();
  expect(q.labeled("watermelon")).toBeChecked();
  await press.ArrowUp();
  expect(q.labeled("watermelon")).not.toBeChecked();
  expect(q.labeled("orange")).toBeChecked();
  expect(q.labeled("orange")).toHaveFocus();
});
