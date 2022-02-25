import { click, getByLabelText, press, render } from "ariakit-test-utils";
import Example from ".";

test("render checkbox", async () => {
  const { container } = render(<Example />);
  expect(container).toMatchInlineSnapshot(`
    <div>
      <div>
        <div>
          Choices:
        </div>
        <div
          class="wrapper"
        >
          <label>
            <input
              aria-checked="false"
              data-command=""
              type="checkbox"
              value="apple"
            />
            apple
          </label>
          <label>
            <input
              aria-checked="false"
              data-command=""
              type="checkbox"
              value="orange"
            />
            orange
          </label>
          <label>
            <input
              aria-checked="false"
              data-command=""
              type="checkbox"
              value="watermelon"
            />
            watermelon
          </label>
        </div>
      </div>
    </div>
  `);
});

test("check/uncheck on click on click", async () => {
  render(<Example />);
  expect(getByLabelText("apple")).toHaveAttribute("aria-checked", "false");
  expect(getByLabelText("orange")).toHaveAttribute("aria-checked", "false");
  expect(getByLabelText("watermelon")).toHaveAttribute("aria-checked", "false");

  await click(getByLabelText("apple"));
  expect(getByLabelText("apple")).toHaveAttribute("aria-checked", "true");
  expect(getByLabelText("orange")).toHaveAttribute("aria-checked", "false");
  expect(getByLabelText("watermelon")).toHaveAttribute("aria-checked", "false");

  await click(getByLabelText("apple"));
  await click(getByLabelText("watermelon"));
  expect(getByLabelText("apple")).toHaveAttribute("aria-checked", "false");
  expect(getByLabelText("orange")).toHaveAttribute("aria-checked", "false");
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

  await press.Tab();
  await press.Space();
  expect(getByLabelText("apple")).not.toHaveFocus();
  expect(getByLabelText("orange")).toHaveFocus();
  expect(getByLabelText("apple")).toBeChecked();
  expect(getByLabelText("orange")).toBeChecked();
});
