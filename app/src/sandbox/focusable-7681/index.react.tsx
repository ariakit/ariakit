import * as Ariakit from "@ariakit/react";
import type { FocusEvent, ReactNode } from "react";
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

// TODO: Remove this workaround when
// https://github.com/ariakit/ariakit/issues/7681 is fixed. Inside a shadow
// root, Ariakit doesn't set data-focus-visible or call onFocusVisible, so this
// asks the browser whether the focused element matches :focus-visible.
function useShadowFocusVisible(onFocusVisible: () => void) {
  const [focusVisible, setFocusVisible] = useState(false);
  return {
    "data-focus-visible": focusVisible || undefined,
    onFocus: (event: FocusEvent<HTMLElement>) => {
      if (event.target !== event.currentTarget) return;
      if (!event.currentTarget.matches(":focus-visible")) return;
      setFocusVisible(true);
      onFocusVisible();
    },
    onBlur: () => setFocusVisible(false),
  };
}

export default function Example() {
  const [buttonCalls, setButtonCalls] = useState(0);
  const [comboboxCalls, setComboboxCalls] = useState(0);
  const buttonProps = useShadowFocusVisible(() =>
    setButtonCalls((calls) => calls + 1),
  );
  const comboboxProps = useShadowFocusVisible(() =>
    setComboboxCalls((calls) => calls + 1),
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Ariakit.Button>Document action</Ariakit.Button>
      <ShadowHost>
        <style>
          {"[data-focus-visible] { outline: 2px solid Highlight; }"}
        </style>
        <div style={{ display: "flex", gap: 8 }}>
          <Ariakit.Button {...buttonProps}>Shadow action</Ariakit.Button>
          <Ariakit.ComboboxProvider>
            <Ariakit.Combobox aria-label="Shadow fruit" {...comboboxProps} />
          </Ariakit.ComboboxProvider>
        </div>
      </ShadowHost>
      <p>Shadow action focus-visible calls: {buttonCalls}</p>
      <p>Shadow fruit focus-visible calls: {comboboxCalls}</p>
    </div>
  );
}
