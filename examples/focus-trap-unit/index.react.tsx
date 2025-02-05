import { FocusTrap } from "@ariakit/react";

export default function Fixture() {
  return (
    <>
      <div role="group" aria-label="trap">
        <button>Start</button>
        <button>Before</button>
        <FocusTrap>Trap</FocusTrap>
        <button>After</button>
      </div>

      <div role="group" aria-label="redirect">
        <button>Start</button>
        <button>Before</button>
        <FocusTrap
          onFocus={() => document.getElementById("focus-target")?.focus()}
        >
          Trap
        </FocusTrap>
        <button>Skip</button>
        <button id="focus-target">Focus target</button>
      </div>
    </>
  );
}
