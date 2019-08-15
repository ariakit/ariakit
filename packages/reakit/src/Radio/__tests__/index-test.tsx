import * as React from "react";
import { render, click } from "reakit-test-utils";
import { Radio, RadioGroup, useRadioState } from "..";

test("click on radio", () => {
  const Test = () => {
    const radio = useRadioState();
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
  click(radio);
  expect(radio.checked).toBe(true);
});

test("click on non-native radio", () => {
  const Test = () => {
    const radio = useRadioState<"radio">();
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
  click(radio);
  expect(radio.checked).toBe(true);
});

test("onChange", () => {
  const Test = () => {
    const { state, setState, ...radio } = useRadioState();
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
  click(radio);
  expect(radio.checked).toBe(true);
});

test("onChange non-native radio", () => {
  const Test = () => {
    const { state, setState, ...radio } = useRadioState();
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
  click(radio);
  expect(radio.checked).toBe(true);
});

test("group", () => {
  const Test = () => {
    type Superhero = "superman" | "batman";
    const radio = useRadioState<Superhero>({ state: "superman" });

    return (
      <RadioGroup {...radio} aria-label="superhero">
        <label>
          <Radio<Superhero> {...radio} id="base-1" value="superman" />
          Clark Kent
        </label>
        <label>
          <Radio {...radio} id="base-2" value="batman" />
          Bruce Wayne
        </label>
      </RadioGroup>
    );
  };
  const { container } = render(<Test />);
  expect(container).toMatchInlineSnapshot(`
    <div>
      <fieldset
        aria-label="superhero"
        role="radiogroup"
      >
        <label>
          <input
            aria-checked="true"
            checked=""
            id="base-1"
            role="radio"
            tabindex="0"
            type="radio"
            value="superman"
          />
          Clark Kent
        </label>
        <label>
          <input
            aria-checked="false"
            id="base-2"
            role="radio"
            tabindex="-1"
            type="radio"
            value="batman"
          />
          Bruce Wayne
        </label>
      </fieldset>
    </div>
  `);
});
