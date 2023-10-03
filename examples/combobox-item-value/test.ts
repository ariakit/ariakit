import { press, q, type } from "@ariakit/test";

test("show highlighted text", async () => {
  await press.Tab();
  await type("a");
  await press.ArrowDown();
  expect(q.option("Apple")).toHaveFocus();
  expect(q.option("Apple")?.innerHTML).toMatchInlineSnapshot(
    '"<span><span data-user-value=\\"\\">A</span><span data-autocomplete-value=\\"\\">pple</span></span>"',
  );
  await press.Enter();
  expect(q.combobox()).toHaveValue("Apple");
});
