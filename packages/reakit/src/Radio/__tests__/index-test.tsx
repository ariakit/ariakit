import * as React from "react";
import { render, click, press } from "reakit-test-utils";
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
    const radio = useRadioState();
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

[true, false].forEach(virtual => {
  describe(virtual ? "aria-activedescendant" : "roving-tabindex", () => {
    test("arrow keys", () => {
      const Test = () => {
        const radio = useRadioState({ unstable_virtual: virtual });
        return (
          <>
            <RadioGroup {...radio} aria-label="radiogroup">
              <label>
                <Radio {...radio} value="a" />a
              </label>
              <label>
                <Radio {...radio} value="b" />b
              </label>
              <label>
                <Radio {...radio} value="c" />c
              </label>
            </RadioGroup>
            <button>button</button>
          </>
        );
      };
      const { getByLabelText } = render(<Test />);
      press.Tab();
      expect(getByLabelText("a")).toHaveFocus();
      expect(getByLabelText("a")).not.toBeChecked();
      press.ArrowLeft();
      expect(getByLabelText("c")).toHaveFocus();
      expect(getByLabelText("c")).toBeChecked();
      press.ArrowRight();
      expect(getByLabelText("a")).toHaveFocus();
      expect(getByLabelText("a")).toBeChecked();
      press.ArrowDown();
      expect(getByLabelText("b")).toHaveFocus();
      expect(getByLabelText("b")).toBeChecked();
      press.Tab();
      press.ShiftTab();
      expect(getByLabelText("b")).toHaveFocus();
      expect(getByLabelText("b")).toBeChecked();
    });

    test("initial checked radio gets initial focus", () => {
      const Test = () => {
        const radio = useRadioState({ unstable_virtual: virtual, state: "b" });
        return (
          <RadioGroup {...radio} aria-label="radiogroup">
            <label>
              <Radio {...radio} value="a" />a
            </label>
            <label>
              <Radio {...radio} value="b" />b
            </label>
            <label>
              <Radio {...radio} value="c" />c
            </label>
          </RadioGroup>
        );
      };
      const { getByLabelText } = render(<Test />);
      press.Tab();
      expect(getByLabelText("b")).toHaveFocus();
    });
  });
});

test("group", () => {
  const Test = () => {
    const radio = useRadioState();
    return (
      <RadioGroup {...radio} aria-label="radiogroup" id="base">
        <label>
          <Radio {...radio} value="a" />a
        </label>
        <label>
          <Radio {...radio} value="b" />b
        </label>
        <label>
          <Radio {...radio} value="c" />c
        </label>
      </RadioGroup>
    );
  };
  const { container } = render(<Test />);
  expect(container).toMatchInlineSnapshot(`
    <div>
      <div
        aria-label="radiogroup"
        id="base"
        role="radiogroup"
      >
        <label>
          <input
            aria-checked="false"
            id="base-1"
            role="radio"
            tabindex="0"
            type="radio"
            value="a"
          />
          a
        </label>
        <label>
          <input
            aria-checked="false"
            id="base-2"
            role="radio"
            tabindex="-1"
            type="radio"
            value="b"
          />
          b
        </label>
        <label>
          <input
            aria-checked="false"
            id="base-3"
            role="radio"
            tabindex="-1"
            type="radio"
            value="c"
          />
          c
        </label>
      </div>
    </div>
  `);
});

test("button group", () => {
  const Test = () => {
    const radio = useRadioState();
    return (
      <RadioGroup {...radio} aria-label="radiogroup" id="base">
        <Radio {...radio} as="button" value="a">
          a
        </Radio>
        <Radio {...radio} as="button" value="b">
          b
        </Radio>
        <Radio {...radio} as="button" value="c">
          c
        </Radio>
      </RadioGroup>
    );
  };
  const { container } = render(<Test />);
  expect(container).toMatchInlineSnapshot(`
<div>
  <div
    aria-label="radiogroup"
    id="base"
    role="radiogroup"
  >
    <button
      aria-checked="false"
      id="base-1"
      role="radio"
      tabindex="0"
      type="radio"
      value="a"
    >
      a
    </button>
    <button
      aria-checked="false"
      id="base-2"
      role="radio"
      tabindex="-1"
      type="radio"
      value="b"
    >
      b
    </button>
    <button
      aria-checked="false"
      id="base-3"
      role="radio"
      tabindex="-1"
      type="radio"
      value="c"
    >
      c
    </button>
  </div>
</div>
`);
});
