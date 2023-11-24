import { press, q } from "@ariakit/test";

test("navigate through items with keyboard", async () => {
  expect(q.button("🍎 Apple")).not.toHaveFocus();
  await press.Tab();
  expect(q.button("🍎 Apple")).toHaveFocus();
  await press.ArrowDown();
  expect(q.button("🍇 Grape")).toHaveFocus();
  await press.ArrowDown();
  expect(q.button("🍊 Orange")).toHaveFocus();
  await press.ArrowUp();
  expect(q.button("🍇 Grape")).toHaveFocus();
  await press.ArrowRight();
  expect(q.button("🍊 Orange")).toHaveFocus();
  await press.ArrowLeft();
  expect(q.button("🍇 Grape")).toHaveFocus();
  await press.ArrowDown();
  await press.ArrowDown(); // do not loop
  expect(q.button("🍊 Orange")).toHaveFocus();
});
