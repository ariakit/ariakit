import {
  click,
  getByLabelText,
  getByRole,
  press,
  render,
} from "ariakit-test-utils";
import Example from ".";

test("render radiogroup", () => {
  render(<Example />);
  expect(getByRole("radiogroup")).toMatchInlineSnapshot(`
    <div
      role="radiogroup"
    >
      <label
        class="label"
      >
        <input
          aria-checked="false"
          class="radio"
          data-active-item=""
          data-command=""
          id="r:0"
          type="radio"
          value="apple"
        />
        apple
      </label>
      <label
        class="label"
      >
        <input
          aria-checked="false"
          class="radio"
          data-command=""
          id="r:2"
          tabindex="-1"
          type="radio"
          value="orange"
        />
        orange
      </label>
      <label
        class="label"
      >
        <input
          aria-checked="false"
          class="radio"
          data-command=""
          id="r:4"
          tabindex="-1"
          type="radio"
          value="watermelon"
        />
        watermelon
      </label>
    </div>
  `);
});

test("check radio button on click", async () => {
  render(<Example />);
  expect(getByLabelText("apple")).toHaveAttribute("aria-checked", "false");
  expect(getByLabelText("orange")).toHaveAttribute("aria-checked", "false");
  expect(getByLabelText("watermelon")).toHaveAttribute("aria-checked", "false");
  await click(getByLabelText("apple"));
  expect(getByLabelText("apple")).toHaveAttribute("aria-checked", "true");
  expect(getByLabelText("orange")).toHaveAttribute("aria-checked", "false");
  expect(getByLabelText("watermelon")).toHaveAttribute("aria-checked", "false");
  await click(getByLabelText("watermelon"));
  expect(getByLabelText("apple")).toHaveAttribute("aria-checked", "false");
  expect(getByLabelText("watermelon")).toHaveAttribute("aria-checked", "true");
});

test("tab", async () => {
  render(<Example />);
  expect(getByLabelText("apple")).not.toHaveFocus();
  expect(getByLabelText("orange")).not.toHaveFocus();
  expect(getByLabelText("watermelon")).not.toHaveFocus();

  await press.Tab();
  expect(getByLabelText("apple")).toHaveFocus();
  expect(getByLabelText("apple")).not.toBeChecked();
  expect(getByLabelText("orange")).not.toHaveFocus();
  expect(getByLabelText("watermelon")).not.toHaveFocus();
});

test("space", async () => {
  render(<Example />);
  await press.Tab();
  expect(getByLabelText("apple")).toHaveFocus();
  expect(getByLabelText("apple")).not.toBeChecked();
  await press.Space();
  expect(getByLabelText("apple")).toHaveFocus();
  expect(getByLabelText("apple")).toBeChecked();
});

test("arrow right", async () => {
  render(<Example />);
  await press.Tab();
  await press.ArrowRight();
  expect(getByLabelText("orange")).toHaveFocus();
  expect(getByLabelText("orange")).toBeChecked();
  await press.ArrowRight();
  expect(getByLabelText("orange")).not.toBeChecked();
  expect(getByLabelText("watermelon")).toBeChecked();
  expect(getByLabelText("watermelon")).toHaveFocus();
});

test("arrow down", async () => {
  render(<Example />);
  await press.Tab();
  await press.ArrowDown();
  expect(getByLabelText("orange")).toHaveFocus();
  expect(getByLabelText("orange")).toBeChecked();
  await press.ArrowDown();
  expect(getByLabelText("orange")).not.toBeChecked();
  expect(getByLabelText("watermelon")).toBeChecked();
  expect(getByLabelText("watermelon")).toHaveFocus();
});

test("arrow left", async () => {
  render(<Example />);
  await press.Tab();
  await press.ArrowLeft();
  expect(getByLabelText("watermelon")).toHaveFocus();
  expect(getByLabelText("watermelon")).toBeChecked();
  await press.ArrowLeft();
  expect(getByLabelText("watermelon")).not.toBeChecked();
  expect(getByLabelText("orange")).toBeChecked();
  expect(getByLabelText("orange")).toHaveFocus();
});

test("arrow up", async () => {
  render(<Example />);
  await press.Tab();
  await press.ArrowUp();
  expect(getByLabelText("watermelon")).toHaveFocus();
  expect(getByLabelText("watermelon")).toBeChecked();
  await press.ArrowUp();
  expect(getByLabelText("watermelon")).not.toBeChecked();
  expect(getByLabelText("orange")).toBeChecked();
  expect(getByLabelText("orange")).toHaveFocus();
});
