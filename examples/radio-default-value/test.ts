import { press, q } from "@ariakit/test";

test("default value", async () => {
  expect(q.labeled("apple")).not.toBeChecked();
  expect(q.labeled("orange")).toBeChecked();
  expect(q.labeled("watermelon")).not.toBeChecked();
});

test("default focus", async () => {
  await press.Tab();
  expect(q.labeled("apple")).not.toHaveFocus();
  expect(q.labeled("orange")).toHaveFocus();
  expect(q.labeled("orange")).toBeChecked();
  expect(q.labeled("watermelon")).not.toHaveFocus();
  await press.ArrowDown();
  expect(q.labeled("watermelon")).toHaveFocus();
  expect(q.labeled("watermelon")).toBeChecked();
  await press.ArrowDown();
  expect(q.labeled("apple")).toHaveFocus();
  expect(q.labeled("apple")).toBeChecked();
});
