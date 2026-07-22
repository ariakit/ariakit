import * as Ariakit from "@ariakit/react";

export default function Example() {
  return (
    <Ariakit.RadioProvider>
      <Ariakit.RadioGroup
        aria-label="Fruits"
        disabled
        render={<fieldset disabled />}
      >
        <label>
          <Ariakit.Radio value="apple" />
          Apple
        </label>
        <label>
          <Ariakit.Radio value="orange" />
          Orange
        </label>
        <label>
          <Ariakit.Radio value="watermelon" />
          Watermelon
        </label>
      </Ariakit.RadioGroup>
    </Ariakit.RadioProvider>
  );
}
