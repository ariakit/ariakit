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
  expect(getOption("Apple")).toMatchInlineSnapshot(`
    <div
      aria-selected="true"
      class="combobox-item"
      data-active-item=""
      data-command=""
      data-composite-hover=""
      data-focus-visible=""
      id=":rr:"
      role="option"
      tabindex="-1"
    >
      <span>
        <span
          data-user-value=""
        >
          A
        </span>
        <span
          data-autocomplete-value=""
        >
          pple
        </span>
      </span>
    </div>
  `);
  await press.Enter();
  expect(getByRole("combobox")).toHaveValue("Apple");
});
