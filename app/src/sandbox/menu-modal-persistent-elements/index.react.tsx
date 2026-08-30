import * as Ariakit from "@ariakit/react";
import type { RefObject } from "react";
import { useRef, useState } from "react";

interface MenuProps extends Ariakit.MenuProps {
  persistentRef: RefObject<HTMLElement | null>;
  extraRef: RefObject<HTMLElement | null>;
  extraPersistent: boolean;
  treeSnapshotKey: number;
}

function Menu({
  persistentRef,
  extraRef,
  extraPersistent,
  treeSnapshotKey,
  ...props
}: MenuProps) {
  const store = Ariakit.useMenuContext();
  return (
    <Ariakit.Menu
      modal
      getPersistentElements={() => {
        const elements: HTMLElement[] = [];
        const disclosureElement = store?.getState().disclosureElement;
        if (disclosureElement) elements.push(disclosureElement);
        if (persistentRef.current) elements.push(persistentRef.current);
        if (extraPersistent && extraRef.current) {
          elements.push(extraRef.current);
        }
        return elements;
      }}
      // An application that returns different elements over time has to tell
      // the dialog when to read them again. The menu contributes its own key
      // for the disclosure, so this one has to survive alongside it.
      // https://github.com/ariakit/ariakit/pull/7303#discussion_r3887846878
      unstable_treeSnapshotKey={treeSnapshotKey}
      {...props}
    />
  );
}

interface MenuItemsProps {
  otherRef: RefObject<HTMLElement | null>;
  onAddExtra: () => void;
}

function MenuItems({ otherRef, onAddExtra }: MenuItemsProps) {
  const store = Ariakit.useMenuContext();
  return (
    <>
      <Ariakit.MenuItem>Edit</Ariakit.MenuItem>
      <Ariakit.MenuItem>Share</Ariakit.MenuItem>
      <Ariakit.MenuItem disabled>Delete</Ariakit.MenuItem>
      <Ariakit.MenuSeparator />
      <Ariakit.MenuItem>Report</Ariakit.MenuItem>
      {/* Hands the menu over to another trigger while it stays open, the way
          an app that swaps its own trigger would. */}
      <Ariakit.MenuItem
        hideOnClick={false}
        onClick={() => {
          if (!otherRef.current) return;
          store?.setDisclosureElement(otherRef.current);
        }}
      >
        Use other trigger
      </Ariakit.MenuItem>
      {/* Makes an element that was already outside the menu persistent while
          the menu stays open, so the dialog has to read the persistent
          elements again to release it from the `inert` subtree. */}
      <Ariakit.MenuItem hideOnClick={false} onClick={onAddExtra}>
        Add extra
      </Ariakit.MenuItem>
    </>
  );
}

export default function Example() {
  const persistentRef = useRef<HTMLButtonElement>(null);
  const otherRef = useRef<HTMLButtonElement>(null);
  const extraRef = useRef<HTMLButtonElement>(null);
  const [extraPersistent, setExtraPersistent] = useState(false);
  const [treeSnapshotKey, setTreeSnapshotKey] = useState(0);

  const addExtra = () => {
    setExtraPersistent(true);
    setTreeSnapshotKey((key) => key + 1);
  };

  return (
    <Ariakit.MenuProvider>
      {/* Rendered before the menu button so that they don't take over the
          first Shift+Tab stop from the open menu. Safari leaves a plain button
          out of the tab order without an explicit tab index, and these have no
          Ariakit component to supply it. */}
      {/* The menu names itself after its disclosure through `aria-labelledby`,
          which only resolves when the disclosure carries an id of its own. */}
      <button ref={otherRef} id="other-trigger" tabIndex={0}>
        Other
      </button>
      <button ref={persistentRef} tabIndex={0}>
        Refresh
      </button>
      <button ref={extraRef} tabIndex={0}>
        Extra
      </button>
      <Ariakit.MenuButton>Actions</Ariakit.MenuButton>
      <Menu
        persistentRef={persistentRef}
        extraRef={extraRef}
        extraPersistent={extraPersistent}
        treeSnapshotKey={treeSnapshotKey}
      >
        <MenuItems otherRef={otherRef} onAddExtra={addExtra} />
      </Menu>
    </Ariakit.MenuProvider>
  );
}
