import * as Ariakit from "@ariakit/react";
import { useState } from "react";
import "./style.css";

export default function Example() {
  // Becomes disabled on the Space keydown to reproduce the case where the
  // element turns disabled between keydown and keyup.
  const [disabled, setDisabled] = useState(false);
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
    </div>
  );
}
