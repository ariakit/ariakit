import * as Ariakit from "@ariakit/react";
import { useState } from "react";

export default function Example() {
  const [childOpen, setChildOpen] = useState(true);
  const [parentInteractions, setParentInteractions] = useState(0);
  const [childInteractions, setChildInteractions] = useState(0);

  return (
    <Ariakit.Dialog open portal={false} backdrop={false}>
      <Ariakit.DialogHeading>Parent</Ariakit.DialogHeading>
      <button
        type="button"
        onClick={() => setParentInteractions((count) => count + 1)}
      >
        Interact with parent
      </button>
      <div role="status" aria-label="Parent count">
        Parent interactions: {parentInteractions}
      </div>

      <Ariakit.Dialog
        open={childOpen}
        onClose={() => setChildOpen(false)}
        portal={false}
        backdrop={false}
        unmountOnHide
      >
        <Ariakit.DialogHeading>Child</Ariakit.DialogHeading>
        <button
          type="button"
          onClick={() => setChildInteractions((count) => count + 1)}
        >
          Interact with child
        </button>
        <div role="status" aria-label="Child count">
          Child interactions: {childInteractions}
        </div>
        <Ariakit.DialogDismiss>Close child</Ariakit.DialogDismiss>
      </Ariakit.Dialog>
    </Ariakit.Dialog>
  );
}
