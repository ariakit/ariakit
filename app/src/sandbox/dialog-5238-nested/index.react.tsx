import * as Ariakit from "@ariakit/react";
import { useState } from "react";

export default function Example() {
  const [parentOpen, setParentOpen] = useState(true);
  const [parentPortal, setParentPortal] = useState(false);
  const [childOpen, setChildOpen] = useState(true);
  const [childPortal, setChildPortal] = useState(false);
  const [siblingOpen, setSiblingOpen] = useState(false);
  const [remountKey, setRemountKey] = useState(0);
  const [parentInteractions, setParentInteractions] = useState(0);
  const [childInteractions, setChildInteractions] = useState(0);
  const [siblingInteractions, setSiblingInteractions] = useState(0);

  return (
    <>
      <Ariakit.Dialog
        key={remountKey}
        open={parentOpen}
        portal={parentPortal}
        backdrop={false}
        unmountOnHide={false}
      >
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
        <button
          type="button"
          onClick={() => {
            setParentOpen(true);
            setChildOpen(true);
            setChildPortal(true);
            setRemountKey((key) => key + 1);
          }}
        >
          Remount with portaled child
        </button>

        <Ariakit.Dialog
          open={childOpen}
          onClose={() => setChildOpen(false)}
          portal={childPortal}
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
          <button type="button" onClick={() => setChildPortal(true)}>
            Move child to portal
          </button>
          <button type="button" onClick={() => setParentOpen(false)}>
            Hide parent
          </button>
          <button type="button" onClick={() => setParentOpen(true)}>
            Show parent
          </button>
          <button
            type="button"
            onClick={() => {
              setParentOpen(true);
              setParentPortal(true);
              setChildOpen(true);
              setChildPortal(true);
              setSiblingOpen(true);
              setRemountKey((key) => key + 1);
            }}
          >
            Remount portaled branch with sibling
          </button>
          <Ariakit.DialogDismiss>Close child</Ariakit.DialogDismiss>
        </Ariakit.Dialog>
      </Ariakit.Dialog>

      <Ariakit.Dialog
        open={siblingOpen}
        onClose={() => setSiblingOpen(false)}
        backdrop={false}
        unmountOnHide
      >
        <Ariakit.DialogHeading>Sibling</Ariakit.DialogHeading>
        <button
          type="button"
          onClick={() => setSiblingInteractions((count) => count + 1)}
        >
          Interact with sibling
        </button>
        <div role="status" aria-label="Sibling count">
          Sibling interactions: {siblingInteractions}
        </div>
      </Ariakit.Dialog>
    </>
  );
}
