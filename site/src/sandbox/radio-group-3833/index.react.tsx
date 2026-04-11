import * as ak from "@ariakit/react";

export default function Example() {
  return (
    <div>
      <ak.RadioProvider>
        <ak.RadioGroup aria-label="Fruits">
          <label>
            <ak.Radio value="apple" />
            Apple
          </label>
          <label>
            <ak.Radio value="orange" />
            Orange
          </label>
          <label>
            <ak.Radio value="watermelon" />
            Watermelon
          </label>
        </ak.RadioGroup>
      </ak.RadioProvider>

      <ak.RadioProvider>
        <ak.RadioGroup aria-label="Vegetables">
          <label>
            <ak.Radio value="potato" />
            Potato
          </label>
          <label>
            <ak.Radio value="carrot" />
            Carrot
          </label>
          <label>
            <ak.Radio value="cabbage" />
            Cabbage
          </label>
        </ak.RadioGroup>
      </ak.RadioProvider>

      <button type="button">Submit</button>
    </div>
  );
}
