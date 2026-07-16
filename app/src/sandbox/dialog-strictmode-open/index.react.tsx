import * as Ariakit from "@ariakit/react";
import { StrictMode, useRef, useState } from "react";

export default function Example() {
  const [open, setOpen] = useState(true);
  const [focusRestores, setFocusRestores] = useState(0);
  const finalFocusRef = useRef<HTMLButtonElement>(null);

  return (
    <StrictMode>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div role="status">Focus restores: {focusRestores}</div>
        <Ariakit.Button ref={finalFocusRef} onClick={() => setOpen(true)}>
          Final focus
        </Ariakit.Button>
        <Ariakit.Dialog
          modal={false}
          open={open}
          onClose={() => setOpen(false)}
          finalFocus={finalFocusRef}
          autoFocusOnHide={() => {
            setFocusRestores((count) => count + 1);
            return true;
          }}
        >
          <p>Initially open dialog</p>
          <Ariakit.DialogDismiss>Close</Ariakit.DialogDismiss>
        </Ariakit.Dialog>
      </div>
    </StrictMode>
  );
}
