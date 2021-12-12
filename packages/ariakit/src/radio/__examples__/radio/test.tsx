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

test("Check radio button on click", async () => {
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

test("Tab key - Moves keyboard focus to the radio group", async () => {
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

test("Space key - Changes the state to checked, if the radio button with focus is not checked", async () => {
  render(<Example />);
  await press.Tab();
  expect(getByLabelText("apple")).toHaveFocus();
  expect(getByLabelText("apple")).not.toBeChecked();
  await press.Space();
  expect(getByLabelText("apple")).toHaveFocus();
  expect(getByLabelText("apple")).toBeChecked();
});

test("Right arrow - Moves the focus to and checks the next radio button in the group", async () => {
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

test("Down arrow - Moves the focus to and checks the next radio button in the group", async () => {
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

test("Left arrow - Moves the focus to and checks the previous radio button in the group", async () => {
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

test("Up arrow - Moves the focus to and checks the previous radio button in the group", async () => {
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
