import { click, getByLabelText, press, render } from "ariakit-test-utils";
import Example from ".";

test("render checkbox", async () => {
  const { container } = render(<Example />);
  expect(container).toMatchInlineSnapshot(`
    <div>
      <ul>
        <li>
          <label>
            <input
              aria-checked="true"
              checked=""
              data-command=""
              type="checkbox"
            />
             Fruits
          </label>
        </li>
        <ul
          class="items"
        >
          <li>
            <label>
              <input
                aria-checked="true"
                checked=""
                data-command=""
                type="checkbox"
                value="apple"
              />

              apple
            </label>
          </li>
          <li>
            <label>
              <input
                aria-checked="true"
                checked=""
                data-command=""
                type="checkbox"
                value="orange"
              />

              orange
            </label>
          </li>
          <li>
            <label>
              <input
                aria-checked="true"
                checked=""
                data-command=""
                type="checkbox"
                value="watermelon"
              />

              watermelon
            </label>
          </li>
        </ul>
      </ul>
    </div>
  `);
});

test("check/uncheck on click on click", async () => {
  render(<Example />);
  expect(getByLabelText("apple")).toHaveAttribute("aria-checked", "true");
  expect(getByLabelText("orange")).toHaveAttribute("aria-checked", "true");
  expect(getByLabelText("watermelon")).toHaveAttribute("aria-checked", "true");
  expect(getByLabelText("Fruits")).toHaveAttribute("aria-checked", "true");

  await click(getByLabelText("apple"));
  expect(getByLabelText("apple")).toHaveAttribute("aria-checked", "false");
  expect(getByLabelText("orange")).toHaveAttribute("aria-checked", "true");
  expect(getByLabelText("watermelon")).toHaveAttribute("aria-checked", "true");
  expect(getByLabelText("Fruits")).toHaveAttribute("aria-checked", "mixed");

  await click(getByLabelText("orange"));
  await click(getByLabelText("watermelon"));
  expect(getByLabelText("apple")).toHaveAttribute("aria-checked", "false");
  expect(getByLabelText("orange")).toHaveAttribute("aria-checked", "false");
  expect(getByLabelText("watermelon")).toHaveAttribute("aria-checked", "false");
  expect(getByLabelText("Fruits")).toHaveAttribute("aria-checked", "false");
});

test("tab", async () => {
  render(<Example />);
  expect(getByLabelText("Fruits")).not.toHaveFocus();
  expect(getByLabelText("apple")).not.toHaveFocus();
  expect(getByLabelText("orange")).not.toHaveFocus();
  expect(getByLabelText("watermelon")).not.toHaveFocus();

  await press.Tab();
  expect(getByLabelText("Fruits")).toHaveFocus();
  expect(getByLabelText("Fruits")).toBeChecked();
  expect(getByLabelText("apple")).not.toHaveFocus();
  expect(getByLabelText("orange")).not.toHaveFocus();
  expect(getByLabelText("watermelon")).not.toHaveFocus();

  await press.Tab();
  expect(getByLabelText("Fruits")).not.toHaveFocus();
  expect(getByLabelText("Fruits")).toBeChecked();
  expect(getByLabelText("apple")).toHaveFocus();
  expect(getByLabelText("orange")).not.toHaveFocus();
  expect(getByLabelText("watermelon")).not.toHaveFocus();
});

test("space", async () => {
  render(<Example />);
  await press.Tab();
  expect(getByLabelText("Fruits")).toHaveFocus();
  expect(getByLabelText("Fruits")).toBeChecked();
  expect(getByLabelText("apple")).toHaveAttribute("aria-checked", "true");
  expect(getByLabelText("orange")).toHaveAttribute("aria-checked", "true");
  expect(getByLabelText("watermelon")).toHaveAttribute("aria-checked", "true");

  await press.Space();
  expect(getByLabelText("Fruits")).toHaveFocus();
  expect(getByLabelText("Fruits")).not.toBeChecked();
  expect(getByLabelText("apple")).toHaveAttribute("aria-checked", "false");
  expect(getByLabelText("orange")).toHaveAttribute("aria-checked", "false");
  expect(getByLabelText("watermelon")).toHaveAttribute("aria-checked", "false");
});
