import * as Ariakit from "@ariakit/react";
import type { FocusEvent } from "react";
import { useState } from "react";
import "./style.css";

// TODO: Remove this workaround once the fix for
// https://github.com/ariakit/ariakit/issues/6340 lands. Command clears its
// in-flight pressed state on a Space keyup, and its metaKey guard prevents the
// synthetic click from firing, so dispatching this synthetic keyup on blur
// cancels an in-flight press when focus moves away while Space is held.
function cancelSpacePressOnBlur(event: FocusEvent<HTMLElement>) {
  event.currentTarget.dispatchEvent(
    new KeyboardEvent("keyup", { key: " ", metaKey: true, bubbles: true }),
  );
}

export default function Example() {
  const [cardClicks, setCardClicks] = useState(0);
  const [pins, setPins] = useState(0);
  return (
    <div>
      <Ariakit.Command
        className="button"
        render={<div />}
        onBlur={cancelSpacePressOnBlur}
      >
        Save
      </Ariakit.Command>
      <Ariakit.Command
        className="button"
        render={<div />}
        onBlur={cancelSpacePressOnBlur}
        onClick={() => setCardClicks((count) => count + 1)}
      >
        Open article{" "}
        <button
          onClick={(event) => {
            // The nested action shouldn't trigger the card click.
            event.stopPropagation();
            setPins((count) => count + 1);
          }}
        >
          Pin
        </button>
      </Ariakit.Command>
      <p>Outside text</p>
      <output>
        card clicks: {cardClicks}, pins: {pins}
      </output>
    </div>
  );
}
