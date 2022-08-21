import { getByRole, press, render, type } from "ariakit-test";
import { axe } from "jest-axe";
import Example from ".";

const getOption = (name: string) =>
  getByRole("option", { name: (_content, node) => node.textContent == name });

test("a11y", async () => {
  const { container } = render(<Example />);
  expect(await axe(container)).toHaveNoViolations();
});

test("show highlighted text", async () => {
  render(<Example />);
  await press.Tab();
  await type("a");
  await press.ArrowDown();
  expect(getOption("Apple")).toHaveFocus();
  expect(getOption("Apple").innerHTML).toMatchInlineSnapshot(
    `"<span><span data-user-value=\\"\\">A</span><span data-autocomplete-value=\\"\\">pple</span></span>"`
  );
  await press.Enter();
  expect(getByRole("combobox")).toHaveValue("Apple");
});
