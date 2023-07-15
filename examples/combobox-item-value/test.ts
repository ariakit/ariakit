import { getByRole, press, type } from "@ariakit/test";

const getOption = (name: string) =>
  getByRole("option", { name: (_content, node) => node.textContent == name });

test("show highlighted text", async () => {
  await press.Tab();
  await type("a");
  await press.ArrowDown();
  expect(getOption("Apple")).toHaveFocus();
  expect(getOption("Apple").innerHTML).toMatchInlineSnapshot(
    '"<span><span data-user-value=\\"\\">A</span><span data-autocomplete-value=\\"\\">pple</span></span>"',
  );
  await press.Enter();
  expect(getByRole("combobox")).toHaveValue("Apple");
});
