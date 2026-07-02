import { q, type } from "@ariakit/test";
import { expect, test } from "vitest";

// Reproduces https://github.com/ariakit/ariakit/issues/6298
test("renders overlapping matches without duplicated text", async () => {
  await type("ana", q.combobox("Your favorite fruit"));

  const option = q.option.ensure("Banana");
  expect(option).toHaveTextContent("Banana");
  expect(option.querySelectorAll("[data-user-value]")).toHaveLength(1);
  expect(option.querySelector("[data-user-value]")).toHaveTextContent("anana");

  const normalizedEmptyValue = q.status.ensure("Normalized empty value");
  expect(normalizedEmptyValue).toHaveTextContent("Cafe");
  expect(
    normalizedEmptyValue.querySelectorAll("[data-user-value]"),
  ).toHaveLength(0);
});
