import * as Ariakit from "@ariakit/react";
import { useState } from "react";

export default function Example() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Ariakit.Button onClick={() => setOpen(true)}>Show modal</Ariakit.Button>
      <Ariakit.Dialog
        open={open}
        onClose={() => setOpen(false)}
        style={{ position: "relative", zIndex: 1 }}
      >
        <Ariakit.DialogHeading>Success</Ariakit.DialogHeading>
        <p>Your payment has been successfully processed.</p>
        <Ariakit.DialogDismiss>OK</Ariakit.DialogDismiss>
      </Ariakit.Dialog>
      <button>Outside dialog</button>
    </>
  );
}
