import * as React from "react";
import { Tabbable } from "reakit/Tabbable";

const FocusVisibleTappable = (props: any) => {
  const [isFocusVisible, setIsFocusVisible] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <>
      <Tabbable
        onFocus={() => setIsFocused(true)}
        onFocusVisible={() => setIsFocusVisible(true)}
        onBlur={() => {
          setIsFocused(false);
          setIsFocusVisible(false);
        }}
        {...props}
      />
      {isFocused && <div>I am focused</div>}
      {isFocusVisible && <div>I am focus visible</div>}
    </>
  );
};

export default function TabbableWithFocusVisible() {
  return (
    <div style={{ display: "inline-flex", flexDirection: "column" }}>
      <FocusVisibleTappable as="button">
        Button with focus visible handler
      </FocusVisibleTappable>

      <label>
        Input with focus visible handler:
        <br />
        <FocusVisibleTappable as="input" />
      </label>

      <FocusVisibleTappable as="button" disabled focusable>
        Disabled focusable button with focus visible handler
      </FocusVisibleTappable>
    </div>
  );
}
