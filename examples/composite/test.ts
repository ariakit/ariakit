import { press, q } from "@ariakit/test";
import { expect, test } from "vitest";

function setActEnvironment(value: boolean) {
  const scope = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean };
  const previousValue = scope.IS_REACT_ACT_ENVIRONMENT;
  scope.IS_REACT_ACT_ENVIRONMENT = value;
  const restoreActEnvironment = () => {
    scope.IS_REACT_ACT_ENVIRONMENT = previousValue;
  };
  return restoreActEnvironment;
}

async function wrapAsync<T>(fn: () => Promise<T>) {
  const restoreActEnvironment = setActEnvironment(false);
  try {
    return await fn();
  } finally {
    restoreActEnvironment();
  }
}

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

test("https://github.com/ariakit/ariakit/issues/4083", async () => {
  expect.assertions(6);

  await press.Tab();

  expect(q.button("🍎 Apple")).toHaveAttribute("data-focus-visible", "true");
  expect(q.button("🍎 Apple")).toHaveAttribute("data-active-item", "true");

  await wrapAsync(async () => {
    document.activeElement?.dispatchEvent(
      new KeyboardEvent("keydown", {
        cancelable: true,
        bubbles: true,
        key: "ArrowDown",
      }),
    );
    await new Promise(requestAnimationFrame);

    expect(q.button("🍎 Apple")).not.toHaveAttribute("data-focus-visible");
    expect(q.button("🍎 Apple")).not.toHaveAttribute("data-active-item");

    expect(q.button("🍇 Grape")).toHaveAttribute("data-active-item", "true");
    expect(q.button("🍇 Grape")).toHaveAttribute("data-focus-visible", "true");
  });
});
