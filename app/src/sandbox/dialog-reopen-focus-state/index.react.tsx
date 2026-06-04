import * as Ariakit from "@ariakit/react";
import { useState } from "react";

export default function Example() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Ariakit.Button onClick={() => setOpen(true)}>Open dialog</Ariakit.Button>
      <Ariakit.Dialog
        open={open}
        onClose={() => setOpen(false)}
        unmountOnHide={false}
        autoFocusOnShow={false}
        autoFocusOnHide={false}
      >
        <Ariakit.DialogHeading>Dialog</Ariakit.DialogHeading>
        <button type="button">Focus inside</button>
        <Ariakit.DialogDismiss>Close dialog</Ariakit.DialogDismiss>
      </Ariakit.Dialog>
    </>
  );
}
