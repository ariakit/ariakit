import * as Ariakit from "@ariakit/react";
import { useState } from "react";
import "./style.css";

export default function Example() {
  const [cardClicks, setCardClicks] = useState(0);
  const [pins, setPins] = useState(0);
  return (
    <div>
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
      <p>Outside text</p>
      <output>
        card clicks: {cardClicks}, pins: {pins}
      </output>
    </div>
  );
}
