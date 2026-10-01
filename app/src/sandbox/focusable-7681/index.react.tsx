import * as Ariakit from "@ariakit/react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface ShadowHostProps {
  children: ReactNode;
}

// Renders its children inside an open shadow root, the way a web component that
// hosts a React app does.
function ShadowHost({ children }: ShadowHostProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [root, setRoot] = useState<ShadowRoot | null>(null);
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    setRoot(host.shadowRoot || host.attachShadow({ mode: "open" }));
  }, []);
  return <div ref={hostRef}>{root && createPortal(children, root)}</div>;
}

export default function Example() {
  const [buttonCalls, setButtonCalls] = useState(0);
  const [comboboxCalls, setComboboxCalls] = useState(0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Ariakit.Button>Document action</Ariakit.Button>
      <ShadowHost>
        <style>
          {"[data-focus-visible] { outline: 2px solid Highlight; }"}
        </style>
        <div style={{ display: "flex", gap: 8 }}>
          <Ariakit.Button
            onFocusVisible={() => setButtonCalls((calls) => calls + 1)}
          >
            Shadow action
          </Ariakit.Button>
          <Ariakit.ComboboxProvider>
            <Ariakit.Combobox
              aria-label="Shadow fruit"
              onFocusVisible={() => setComboboxCalls((calls) => calls + 1)}
            />
          </Ariakit.ComboboxProvider>
        </div>
      </ShadowHost>
      <p>Shadow action focus-visible calls: {buttonCalls}</p>
      <p>Shadow fruit focus-visible calls: {comboboxCalls}</p>
    </div>
  );
}
