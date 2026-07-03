import { click, q, type } from "@ariakit/test";
import { expect, test } from "vitest";

const decomposedCafe = "cafe\u0301";
const decomposedCafet = `${decomposedCafe}t`;
const decomposedCafeteria = `${decomposedCafe}teria`;
const composedCafeteria = "caféteria";

function expectSafeValue(value: string, expectedValues: string[]) {
  expect(expectedValues).toContain(value);
}

function getInputValue(element: HTMLElement) {
  if (element instanceof HTMLInputElement) {
    return element.value;
  }
  return "";
}

// https://github.com/ariakit/ariakit/issues/6315
test("does not corrupt decomposed inline completion", async () => {
  const combobox = q.combobox.ensure("Your favorite drink");

  await click(combobox);
  await type(decomposedCafe);
  expectSafeValue(getInputValue(combobox), [
    decomposedCafe,
    decomposedCafeteria,
    composedCafeteria,
  ]);

  await click(q.button("Save"));
  expectSafeValue(q.status.ensure().textContent ?? "", [
    decomposedCafe,
    decomposedCafeteria,
    composedCafeteria,
  ]);
});

test("does not drop completion characters after decomposed input", async () => {
  const combobox = q.combobox.ensure("Your favorite drink");

  await click(combobox);
  await type(decomposedCafet);
  expectSafeValue(getInputValue(combobox), [
    decomposedCafet,
    decomposedCafeteria,
    composedCafeteria,
  ]);

  await click(q.button("Save"));
  expectSafeValue(q.status.ensure().textContent ?? "", [
    decomposedCafet,
    decomposedCafeteria,
    composedCafeteria,
  ]);
});

test("completes unaccented input against accented items", async () => {
  const combobox = q.combobox.ensure("Your favorite drink");

  await click(combobox);
  await type("cafe ");
  expect(getInputValue(combobox)).toBe("cafe au lait");

  await click(q.button("Save"));
  expect(q.status()).toHaveTextContent("cafe au lait");
});
