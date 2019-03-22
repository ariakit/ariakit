import * as React from "react";
import { fireEvent, render } from "react-testing-library";
import { Radio, useRadioState } from "..";

test("single checkbox", () => {
  const Test = () => {
    const checkbox = useRadioState();
    return (
      <label>
        <Radio {...checkbox} />
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
