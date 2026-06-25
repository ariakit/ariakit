import { click, q, type } from "@ariakit/test";
import { expect, test } from "vitest";

const decomposedCafe = "cafe\u0301";
const decomposedCafet = `${decomposedCafe}t`;

function expectSafeValue(value: string, expectedValues: string[]) {
  expect(expectedValues).toContain(value);
}

// https://github.com/ariakit/ariakit/issues/6315
test("does not corrupt decomposed inline completion", async () => {
  const combobox = q.combobox.ensure("Your favorite drink");

  await click(combobox);
  await type(decomposedCafe);
  expectSafeValue(combobox.value, [decomposedCafe, "caféteria"]);

  await click(q.button("Save"));
  expectSafeValue(q.status.ensure().textContent ?? "", [
    decomposedCafe,
    "caféteria",
  ]);
});

test("does not drop completion characters after decomposed input", async () => {
  const combobox = q.combobox.ensure("Your favorite drink");

  await click(combobox);
  await type(decomposedCafet);
  expectSafeValue(combobox.value, [decomposedCafet, "caféteria"]);

  await click(q.button("Save"));
  expectSafeValue(q.status.ensure().textContent ?? "", [
    decomposedCafet,
    "caféteria",
  ]);
});
