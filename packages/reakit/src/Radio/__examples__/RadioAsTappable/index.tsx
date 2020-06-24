import * as React from "react";
import { useRadioState, Radio, RadioGroup } from "reakit/Radio";

const useActiveElement = () => {
  const [active, setActive] = React.useState(document.activeElement);

  const handleFocusIn = () => {
    setActive(document.activeElement);
  };

  React.useEffect(() => {
    document.addEventListener("focusin", handleFocusIn);
    return () => {
      document.removeEventListener("focusin", handleFocusIn);
    };
  }, []);

  return active;
};

export default function RadioAsTappable() {
  const radio = useRadioState({ state: "orange" });

  const focusedElement = useActiveElement();

  return (
    <>
      <p>{radio.currentId} has been checked</p>
      <p> {focusedElement?.id || "body"} has the focus</p>
      <RadioGroup {...radio} aria-label="fruits">
        <label htmlFor="orange">orange</label>
        <Radio {...radio} value="orange" id="orange" />
        <label>
          <Radio {...radio} value="apple" data-testid="apple" />
          apple
        </label>
        <label>
          <Radio {...radio} value="banana" data-testid="banana" />
          <span>banana</span>
        </label>
        <Radio {...radio} value="watermelon" id="watermelon" />
        <label htmlFor="watermelon">watermelon</label>
      </RadioGroup>
    </>
  );
}
