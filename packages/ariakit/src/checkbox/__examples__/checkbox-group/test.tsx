import { click, getByLabelText, press, render } from "ariakit-test-utils";
import Example from ".";

test("render checkbox", async () => {
  const { container } = render(<Example />);
  expect(container).toMatchInlineSnapshot(`
    <div>
      <div>
        <label
          class="label"
        >
          <input
            aria-checked="false"
            class="checkbox"
            data-command=""
            type="checkbox"
            value="apple"
          />
           Apple
        </label>
        <label
          class="label"
        >
          <input
            aria-checked="false"
            class="checkbox"
            data-command=""
            type="checkbox"
            value="orange"
          />
           Orange
        </label>
        <label
          class="label"
        >
          <input
            aria-checked="false"
            class="checkbox"
            data-command=""
            type="checkbox"
            value="mango"
          />
           Mango
        </label>
      </div>
    </div>
  `);
});

test("check checkbox on click", async () => {
  render(<Example />);
  expect(getByLabelText("Apple")).not.toBeChecked();
  await click(getByLabelText("Apple"));
  expect(getByLabelText("Apple")).toBeChecked();

  expect(getByLabelText("Orange")).not.toBeChecked();
  await click(getByLabelText("Orange"));
  expect(getByLabelText("Orange")).toBeChecked();

  expect(getByLabelText("Mango")).not.toBeChecked();
  await click(getByLabelText("Mango"));
  expect(getByLabelText("Mango")).toBeChecked();
});

test("tab", async () => {
  render(<Example />);
  expect(getByLabelText("Apple")).not.toHaveFocus();
  await press.Tab();
  expect(getByLabelText("Apple")).toHaveFocus();
  await press.Tab();
  expect(getByLabelText("Orange")).toHaveFocus();
  await press.Tab();
  expect(getByLabelText("Mango")).toHaveFocus();
});

test("space", async () => {
  render(<Example />);
  await press.Tab();
  expect(getByLabelText("Apple")).toHaveFocus();
  expect(getByLabelText("Apple")).not.toBeChecked();
  await press.Space();
  expect(getByLabelText("Apple")).toBeChecked();
  await press.Space();
  expect(getByLabelText("Apple")).not.toBeChecked();
});
