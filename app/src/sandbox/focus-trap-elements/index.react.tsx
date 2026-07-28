import { FocusTrap } from "@ariakit/react";

export default function Example() {
  return (
    <>
      <div aria-label="trap" role="group">
        <button>Start</button>
        <button>Before</button>
        <FocusTrap>Trap</FocusTrap>
        <button>After</button>
      </div>
      <div aria-label="redirect" role="group">
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
