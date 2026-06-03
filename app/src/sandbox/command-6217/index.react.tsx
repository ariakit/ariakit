import * as Ariakit from "@ariakit/react";
import { useState } from "react";
import "./style.css";

export default function Example() {
  // Becomes disabled on the Space keydown to reproduce the case where the
  // element turns disabled between keydown and keyup.
  const [disabled, setDisabled] = useState(false);

  // TODO: Remove this workaround once
  // https://github.com/ariakit/ariakit/issues/6217 is fixed. Command's onKeyUp
  // can short-circuit (Meta held on release, or the element became disabled
  // mid-press) before clearing its internal active state, leaving `data-active`
  // stuck. Shadow `data-active` with our own state — Command lets consumer props
  // override it — and clear it on every Space keyup, which runs before those
  // short-circuit guards.
  const [metaActive, setMetaActive] = useState(false);
  const [pressActive, setPressActive] = useState(false);

  return (
    <div>
      <Ariakit.Command
        className="button"
        render={<div />}
        data-active={metaActive || undefined}
        onKeyDown={(event) => {
          if (event.key === " ") {
            setMetaActive(true);
          }
        }}
        onKeyUp={(event) => {
          if (event.key === " ") {
            setMetaActive(false);
          }
        }}
      >
        Meta release
      </Ariakit.Command>
      <Ariakit.Command
        className="button"
        render={<div />}
        disabled={disabled}
        data-active={pressActive || undefined}
        onKeyDown={(event) => {
          if (event.key === " ") {
            setDisabled(true);
            setPressActive(true);
          }
        }}
        onKeyUp={(event) => {
          if (event.key === " ") {
            setPressActive(false);
          }
        }}
      >
        Disable on press
      </Ariakit.Command>
    </div>
  );
}
