import * as Ariakit from "@ariakit/react";

function getRadioId(value: Ariakit.RadioStoreState["value"]) {
  switch (value) {
    case "one":
      return "option-one";
    case "two":
      return "option-two";
    case "three":
      return "option-three";
    default:
      return;
  }
}

export default function Example() {
  const radio = Ariakit.useRadioStore();

  return (
    <form>
      <Ariakit.RadioGroup
        store={radio}
        aria-label="Options"
        // TODO: Remove this workaround once
        // https://github.com/ariakit/ariakit/pull/6573 lands.
        onBlurCapture={(event) => {
          const nextElement = event.relatedTarget;
          const focusRemainsInGroup =
            nextElement instanceof Node &&
            event.currentTarget.contains(nextElement);
          if (focusRemainsInGroup) return;
          radio.setActiveId(getRadioId(radio.getState().value));
        }}
      >
        <label>
          <Ariakit.Radio id="option-one" value="one" />
          Option 1
        </label>
        <label>
          <Ariakit.Radio id="option-two" value="two" />
          Option 2
        </label>
        <label>
          <Ariakit.Radio id="option-three" value="three" />
          Option 3
        </label>
      </Ariakit.RadioGroup>
      <button type="button">After</button>
    </form>
  );
}
