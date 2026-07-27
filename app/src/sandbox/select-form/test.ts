import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// examples/select-form/test.ts
test("submits the selected value through the native control", async () => {
  await click(q.button("Submit"));
  expect(q.status()).toHaveTextContent("Submitted: Apple");

  await click(q.combobox("Favorite fruit"));
  await click(q.option("Orange"));
  await click(q.button("Submit"));
  expect(q.status()).toHaveTextContent("Submitted: Orange");
});
