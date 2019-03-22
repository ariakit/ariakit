import * as React from "react";
import { fireEvent, render } from "react-testing-library";
import { Checkbox, useCheckboxState } from "..";

test("single checkbox", () => {
  const Test = () => {
    const checkbox = useCheckboxState();
    return (
      <label>
        <Checkbox {...checkbox} />
        checkbox
      </label>
    );
  };
  const { getByLabelText } = render(<Test />);
  const checkbox = getByLabelText("checkbox") as HTMLInputElement;
  expect(checkbox.checked).toBe(false);
  fireEvent.click(checkbox);
  expect(checkbox.checked).toBe(true);
});

test("group checkbox", async () => {
  const Test = () => {
    const checkbox = useCheckboxState({ currentValue: ["orange"] });
    return (
      <div role="group">
        <label>
          <Checkbox as="div" {...checkbox} value="apple" />
          apple
        </label>
        <label>
          <Checkbox {...checkbox} value="orange" />
          orange
        </label>
        <label>
          <Checkbox {...checkbox} value="watermelon" />
          watermelon
        </label>
      </div>
    );
  };
  const { getByLabelText } = render(<Test />);
  const apple = getByLabelText("apple") as HTMLInputElement;
  const orange = getByLabelText("orange") as HTMLInputElement;
  const watermelon = getByLabelText("watermelon") as HTMLInputElement;
  expect(apple.checked).toBe(false);
  expect(orange.checked).toBe(true);
  expect(watermelon.checked).toBe(false);
  fireEvent.click(apple);
  expect(apple.checked).toBe(true);
  expect(orange.checked).toBe(true);
  expect(watermelon.checked).toBe(false);
});
