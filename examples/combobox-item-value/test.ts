import { expect, test, press, q, type } from "../../browser-test-utils.ts";

test("show highlighted text", async () => {
  await press.Tab();
  await type("a");
  await press.ArrowDown();
  expect(q.option("Apple")).toHaveFocus();
  expect(q.option("Apple").query()?.innerHTML).toMatchInlineSnapshot(
    `"<span><span data-user-value="">A</span><span data-autocomplete-value="">pple</span></span>"`,
  );
  await press.Enter();
  expect(q.combobox()).toHaveValue("Apple");
});

test("show repeated highlighted text", async () => {
  await press.Tab();
  await type("p");
  await press.ArrowDown();
  expect(q.option("Apple")).toHaveFocus();
  expect(q.option("Apple").query()?.innerHTML).toMatchInlineSnapshot(
    `"<span><span data-autocomplete-value="">A</span><span data-user-value="">p</span><span data-user-value="">p</span><span data-autocomplete-value="">le</span></span>"`,
  );
});
