import {
  expect,
  test,
  dispatch,
  press,
  q,
  sleep,
  waitFor,
} from "../../browser-test-utils.ts";

test("navigate through items with keyboard", async () => {
  expect(q.button("🍎 Apple")).not.toHaveFocus();
  await waitFor(() =>
    expect(q.button("🍎 Apple")).toHaveAttribute("data-active-item"),
  );

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

test("https://github.com/ariakit/ariakit/issues/4083", async () => {
  expect.assertions(6);

  await press.Tab();

  expect(q.button("🍎 Apple")).toHaveAttribute("data-focus-visible", "true");
  expect(q.button("🍎 Apple")).toHaveAttribute("data-active-item", "true");

  await dispatch.keyDown(document.activeElement, {
    cancelable: true,
    bubbles: true,
    key: "ArrowDown",
  });
  await sleep(0);

  expect(q.button("🍎 Apple")).not.toHaveAttribute("data-focus-visible");
  expect(q.button("🍎 Apple")).not.toHaveAttribute("data-active-item");

  expect(q.button("🍇 Grape")).toHaveAttribute("data-active-item", "true");
  expect(q.button("🍇 Grape")).toHaveAttribute("data-focus-visible", "true");
});
