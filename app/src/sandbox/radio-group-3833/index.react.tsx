import * as ak from "@ariakit/react";
import type { FormEvent } from "react";

export default function Example() {
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    alert(JSON.stringify(Object.fromEntries(data)));
  };

  return (
    <form onSubmit={onSubmit}>
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

      <button type="submit">Submit</button>
    </form>
  );
}
