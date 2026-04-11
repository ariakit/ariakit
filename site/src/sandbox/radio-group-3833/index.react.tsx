import * as ak from "@ariakit/react";

export default function Example() {
  return (
    <div>
      <ak.RadioProvider>
        <ak.RadioGroup aria-label="Fruits">
          <label>
            {/* TODO: Remove name once https://github.com/ariakit/ariakit/issues/3833 is fixed */}
            <ak.Radio name="fruits" value="apple" />
            Apple
          </label>
          <label>
            <ak.Radio name="fruits" value="orange" />
            Orange
          </label>
          <label>
            <ak.Radio name="fruits" value="watermelon" />
            Watermelon
          </label>
        </ak.RadioGroup>
      </ak.RadioProvider>

      <ak.RadioProvider>
        <ak.RadioGroup aria-label="Vegetables">
          <label>
            {/* TODO: Remove name once https://github.com/ariakit/ariakit/issues/3833 is fixed */}
            <ak.Radio name="vegetables" value="potato" />
            Potato
          </label>
          <label>
            <ak.Radio name="vegetables" value="carrot" />
            Carrot
          </label>
          <label>
            <ak.Radio name="vegetables" value="cabbage" />
            Cabbage
          </label>
        </ak.RadioGroup>
      </ak.RadioProvider>

      <button type="button">Submit</button>
    </div>
  );
}
