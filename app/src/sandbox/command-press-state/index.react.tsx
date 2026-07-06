import * as Ariakit from "@ariakit/react";
import { useState } from "react";
import "./style.css";

export default function Example() {
  // Becomes disabled on the Space keydown to reproduce the case where the
  // element turns disabled between keydown and keyup.
  const [disabled, setDisabled] = useState(false);
  const [cardClicks, setCardClicks] = useState(0);
  const [pins, setPins] = useState(0);
  return (
    <div>
      <Ariakit.Command className="button" render={<div />}>
        Meta release
      </Ariakit.Command>
      <Ariakit.Command
        className="button"
        render={<div />}
        disabled={disabled}
        onKeyDown={(event) => {
          if (event.key === " ") {
            setDisabled(true);
          }
        }}
      >
        Disable on press
      </Ariakit.Command>
      <Ariakit.Command className="button" render={<div />}>
        Save
      </Ariakit.Command>
      <Ariakit.Command
        className="button"
        render={<div />}
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
      <Ariakit.Command
        className="button"
        render={<div />}
        onKeyUp={(event) => {
          // Suppresses the click on release, a way to opt out of the default
          // keyup behavior. It must not leave the element stuck looking
          // pressed.
          event.preventDefault();
        }}
      >
        Bookmark
      </Ariakit.Command>
      <p>Outside text</p>
      <output>
        card clicks: {cardClicks}, pins: {pins}
      </output>
    </div>
  );
}
