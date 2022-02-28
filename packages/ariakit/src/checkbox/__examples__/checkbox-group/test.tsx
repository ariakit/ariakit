import { click, getByLabelText, press, render } from "ariakit-test-utils";
import Example from ".";

test("render checkbox", async () => {
  const { container } = render(<Example />);
  expect(container).toMatchInlineSnapshot(`
    <div>
      <div
        aria-labelledby="r:0"
        class="group"
        role="group"
      >
        <div
          aria-hidden="true"
          class="group-label"
          id="r:0"
        >
          Your favorite fruits
        </div>
        <br />
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

test("check/uncheck on click on click", async () => {
  render(<Example />);
  expect(getByLabelText("Apple")).toHaveAttribute("aria-checked", "false");
  expect(getByLabelText("Orange")).toHaveAttribute("aria-checked", "false");
  expect(getByLabelText("Mango")).toHaveAttribute("aria-checked", "false");

  await click(getByLabelText("Apple"));
  expect(getByLabelText("Apple")).toHaveAttribute("aria-checked", "true");
  expect(getByLabelText("Orange")).toHaveAttribute("aria-checked", "false");
  expect(getByLabelText("Mango")).toHaveAttribute("aria-checked", "false");

  await click(getByLabelText("Apple"));
  await click(getByLabelText("Mango"));
  expect(getByLabelText("Apple")).toHaveAttribute("aria-checked", "false");
  expect(getByLabelText("Orange")).toHaveAttribute("aria-checked", "false");
  expect(getByLabelText("Mango")).toHaveAttribute("aria-checked", "true");
});

test("tab", async () => {
  render(<Example />);
  expect(getByLabelText("Apple")).not.toHaveFocus();
  expect(getByLabelText("Orange")).not.toHaveFocus();
  expect(getByLabelText("Mango")).not.toHaveFocus();

  await press.Tab();
  expect(getByLabelText("Apple")).toHaveFocus();
  expect(getByLabelText("Apple")).not.toBeChecked();
  expect(getByLabelText("Orange")).not.toHaveFocus();
  expect(getByLabelText("Mango")).not.toHaveFocus();
});

test("space", async () => {
  render(<Example />);
  await press.Tab();
  expect(getByLabelText("Apple")).toHaveFocus();
  expect(getByLabelText("Apple")).not.toBeChecked();

  await press.Space();
  expect(getByLabelText("Apple")).toHaveFocus();
  expect(getByLabelText("Apple")).toBeChecked();

  await press.Tab();
  await press.Space();
  expect(getByLabelText("Apple")).not.toHaveFocus();
  expect(getByLabelText("Orange")).toHaveFocus();
  expect(getByLabelText("Apple")).toBeChecked();
  expect(getByLabelText("Orange")).toBeChecked();
});
