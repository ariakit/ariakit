import * as Ariakit from "@ariakit/react";

export default function Example() {
  return (
    <form>
      <Ariakit.RadioProvider>
        <Ariakit.RadioGroup aria-label="Options">
          <label>
            <Ariakit.Radio value="one" />
            Option 1
          </label>
          <label>
            <Ariakit.Radio value="two" />
            Option 2
          </label>
          <label>
            <Ariakit.Radio value="three" />
            Option 3
          </label>
        </Ariakit.RadioGroup>
      </Ariakit.RadioProvider>
      <button type="button">After</button>
    </form>
  );
}
