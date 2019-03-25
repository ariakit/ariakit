import * as React from "react";
import { render, fireEvent } from "react-testing-library";
import { unstable_Radio as Radio, unstable_useRadioState } from "..";

test("click on radio", () => {
  const Test = () => {
    const radio = unstable_useRadioState();
    return (
      <label>
        <Radio {...radio} value="radio" />
        radio
      </label>
    );
  };
  const { getByLabelText } = render(<Test />);
  const radio = getByLabelText("radio") as HTMLInputElement;
  expect(radio.checked).toBe(false);
  fireEvent.click(radio);
  expect(radio.checked).toBe(true);
});

test("click on non-native radio", () => {
  const Test = () => {
    const radio = unstable_useRadioState();
    return (
      <label>
        <Radio {...radio} as="div" value="radio" />
        radio
      </label>
    );
  };
  const { getByLabelText } = render(<Test />);
  const radio = getByLabelText("radio") as HTMLInputElement;
  expect(radio.checked).toBe(false);
  fireEvent.click(radio);
  expect(radio.checked).toBe(true);
});

test("onChange", () => {
  const Test = () => {
    const { currentValue, setValue, ...radio } = unstable_useRadioState();
    const [checked, setChecked] = React.useState(false);
    const toggle = () => setChecked(!checked);
    return (
      <label>
        <Radio {...radio} value="radio" onChange={toggle} checked={checked} />
        radio
      </label>
    );
  };
  const { getByLabelText } = render(<Test />);
  const radio = getByLabelText("radio") as HTMLInputElement;
  expect(radio.checked).toBe(false);
  fireEvent.click(radio);
  expect(radio.checked).toBe(true);
});

test("onChange non-native radio", () => {
  const Test = () => {
    const { currentValue, setValue, ...radio } = unstable_useRadioState();
    const [checked, setChecked] = React.useState(false);
    const toggle = () => setChecked(!checked);
    return (
      <label>
        <Radio
          {...radio}
          as="div"
          value="radio"
          onChange={toggle}
          checked={checked}
        />
        radio
      </label>
    );
  };
  const { getByLabelText } = render(<Test />);
  const radio = getByLabelText("radio") as HTMLInputElement;
  expect(radio.checked).toBe(false);
  fireEvent.click(radio);
  expect(radio.checked).toBe(true);
});
