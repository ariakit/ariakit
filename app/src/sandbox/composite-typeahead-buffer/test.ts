import { click, press, q, type } from "@ariakit/test";
import { expect, test } from "vitest";

test("keeps typeahead characters scoped to each composite instance", async () => {
  await press.Tab();

  expect(q.button("Alpha")).toHaveFocus();

  await type("a");
  expect(q.button("Alpine")).toHaveFocus();

  await type("p");
  expect(q.button("Apricot")).toHaveFocus();

  await click(q.button("Banana"));
  expect(q.button("Banana")).toHaveFocus();

  await type("b");
  expect(q.button("Blueberry")).toHaveFocus();
});
