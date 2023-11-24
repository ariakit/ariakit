import { press, q } from "@ariakit/test";

test("navigate through items with keyboard", async () => {
  expect(q.button("🍎 Apple")).not.toHaveFocus();
  expect(q.button("🍎 Apple")).toHaveAttribute("data-active-item");

  await press.Tab();
  expect(q.button("🍎 Apple")).toHaveFocus();
  expect(q.button("🍎 Apple")).toHaveAttribute("data-active-item");

  await press.ArrowDown();
  expect(q.button("🍇 Grape")).toHaveFocus();
  expect(q.button("🍇 Grape")).toHaveAttribute("data-active-item");

  await press.ArrowDown();
  expect(q.button("🍊 Orange")).toHaveFocus();
  expect(q.button("🍊 Orange")).toHaveAttribute("data-active-item");

  await press.ArrowUp();
  expect(q.button("🍇 Grape")).toHaveFocus();
  expect(q.button("🍇 Grape")).toHaveAttribute("data-active-item");

  await press.ArrowRight();
  expect(q.button("🍊 Orange")).toHaveFocus();
  expect(q.button("🍊 Orange")).toHaveAttribute("data-active-item");

  await press.ArrowLeft();
  expect(q.button("🍇 Grape")).toHaveFocus();
  expect(q.button("🍇 Grape")).toHaveAttribute("data-active-item");

  await press.ArrowDown();
  await press.ArrowDown(); // should not loop
  expect(q.button("🍊 Orange")).toHaveFocus();
  expect(q.button("🍊 Orange")).toHaveAttribute("data-active-item");
});
