import * as Ariakit from "@ariakit/react";

export default function Example() {
  return (
    <Ariakit.RadioProvider>
      <Ariakit.RadioGroup aria-label="Fruits" disabled>
        <label>
          <Ariakit.Radio value="apple" />
          Apple
        </label>
        <label>
          <Ariakit.Radio disabled={false} value="orange" />
          Orange
        </label>
        <label>
          <Ariakit.Radio value="watermelon" />
          Watermelon
        </label>
        <Ariakit.Radio render={<div>Banana</div>} value="banana" />
      </Ariakit.RadioGroup>
    </Ariakit.RadioProvider>
  );
}
