import { q, sleep } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/pull/6832
test("does not take focus when the popup starts open", async () => {
  await sleep();

  expect(document.body).toHaveFocus();
  expect(q.combobox("Vegetable")).not.toHaveFocus();
  expect(q.option("Onion")).not.toHaveFocus();
});
