import * as Ariakit from "@ariakit/react";
import { useMenu } from "@ariakit/react-components/menu/menu";
import { useLayoutEffect, useState } from "react";

type Mode =
  | "active"
  | "passive"
  | "modal"
  | "controlled"
  | "headless"
  | "relationship"
  | "hidden"
  | "lazy"
  | "late"
  | "late-controlled"
  | "deferred";

function DeferredActions() {
  const [open, setOpen] = useState(false);
  const store = Ariakit.useMenuStore();

  return (
    <>
      <button onClick={() => setOpen(true)}>Show deferred actions</button>
      <Ariakit.Menu open={open} store={store}>
        <Ariakit.MenuItem>Archive</Ariakit.MenuItem>
      </Ariakit.Menu>
    </>
  );
}

function HeadlessActions() {
  const store = Ariakit.useMenuStore({ defaultOpen: true });
  const props = useMenu({
    store,
    "aria-label": "Hook actions",
  });

  return (
    <Ariakit.Role {...props}>
      <Ariakit.MenuItem store={store}>Inspect</Ariakit.MenuItem>
    </Ariakit.Role>
  );
}

function PassiveActions() {
  const store = Ariakit.useMenuStore({ defaultOpen: true });
  const autoFocusOnShow = Ariakit.useStoreState(store, "autoFocusOnShow");

  return (
    <>
      <Ariakit.MenuButton store={store}>
        Actions for new item
      </Ariakit.MenuButton>
      <Ariakit.Menu autoFocusOnShow={false} store={store}>
        <Ariakit.MenuItem>Rename</Ariakit.MenuItem>
        <Ariakit.MenuItem>Duplicate</Ariakit.MenuItem>
      </Ariakit.Menu>
      <span>Store autofocus: {autoFocusOnShow ? "enabled" : "disabled"}</span>
    </>
  );
}

function HiddenOnMountActions() {
  const store = Ariakit.useMenuStore({ defaultOpen: true });

  useLayoutEffect(() => {
    store.hide();
  }, [store]);

  return (
    <>
      <button onClick={store.show}>Show initially hidden actions</button>
      <Ariakit.Menu store={store}>
        <Ariakit.MenuItem>Download</Ariakit.MenuItem>
      </Ariakit.Menu>
    </>
  );
}

function LazyActions() {
  const [showMenu, setShowMenu] = useState(false);
  const store = Ariakit.useMenuStore();

  return (
    <>
      <button
        onClick={() => {
          store.show();
          setShowMenu(true);
        }}
      >
        Show lazy actions
      </button>
      {showMenu && (
        <Ariakit.Menu store={store}>
          <Ariakit.MenuItem>Export</Ariakit.MenuItem>
        </Ariakit.Menu>
      )}
    </>
  );
}

function LateActions({ controlled = false }: { controlled?: boolean }) {
  const [showMenu, setShowMenu] = useState(false);
  const store = Ariakit.useMenuStore({ defaultOpen: !controlled });
  const label = controlled ? "Late controlled actions" : "Late actions";

  return (
    <>
      <button onClick={() => setShowMenu(true)}>
        Render {controlled ? "controlled" : "default-open"} actions
      </button>
      {showMenu && (
        <Ariakit.Menu
          aria-label={label}
          open={controlled ? true : undefined}
          store={store}
        >
          <Ariakit.MenuItem>{controlled ? "Publish" : "Move"}</Ariakit.MenuItem>
        </Ariakit.Menu>
      )}
    </>
  );
}

function RelationshipActions() {
  const [hasParent, setHasParent] = useState(false);
  const parent = Ariakit.useMenuStore();
  const store = Ariakit.useMenuStore({
    defaultOpen: true,
    parent: hasParent ? parent : null,
  });

  return (
    <>
      <Ariakit.MenuButton store={store}>
        Actions for related item
      </Ariakit.MenuButton>
      <Ariakit.Menu autoFocusOnHide={false} modal={false} store={store}>
        <Ariakit.MenuItem
          hideOnClick={false}
          onClick={() => {
            store.setAutoFocusOnShow(false);
            setHasParent(true);
          }}
        >
          {hasParent ? "Parent changed" : "Change parent"}
        </Ariakit.MenuItem>
      </Ariakit.Menu>
    </>
  );
}

export default function Example() {
  const [mode, setMode] = useState<Mode>();

  if (!mode) {
    return (
      <>
        <button onClick={() => setMode("active")}>Add item</button>
        <button onClick={() => setMode("passive")}>Add passive item</button>
        <button onClick={() => setMode("modal")}>Add modal item</button>
        <button onClick={() => setMode("controlled")}>
          Add controlled item
        </button>
        <button onClick={() => setMode("headless")}>Add hook item</button>
        <button onClick={() => setMode("relationship")}>
          Add related item
        </button>
        <button onClick={() => setMode("hidden")}>
          Add initially hidden item
        </button>
        <button onClick={() => setMode("lazy")}>Add lazy item</button>
        <button onClick={() => setMode("late")}>
          Add late default-open item
        </button>
        <button onClick={() => setMode("late-controlled")}>
          Add late controlled item
        </button>
        <button onClick={() => setMode("deferred")}>Add deferred item</button>
      </>
    );
  }

  if (mode === "relationship") {
    return <RelationshipActions />;
  }

  if (mode === "headless") {
    return <HeadlessActions />;
  }

  if (mode === "passive") {
    return <PassiveActions />;
  }

  if (mode === "deferred") {
    return <DeferredActions />;
  }

  if (mode === "hidden") {
    return <HiddenOnMountActions />;
  }

  if (mode === "lazy") {
    return <LazyActions />;
  }

  if (mode === "late") {
    return <LateActions />;
  }

  if (mode === "late-controlled") {
    return <LateActions controlled />;
  }

  return (
    <Ariakit.MenuProvider defaultOpen={mode !== "controlled"}>
      <Ariakit.MenuButton>Actions for new item</Ariakit.MenuButton>
      <Ariakit.Menu
        modal={mode === "modal"}
        open={mode === "controlled" ? true : undefined}
      >
        <Ariakit.MenuItem>Rename</Ariakit.MenuItem>
        <Ariakit.MenuItem>Duplicate</Ariakit.MenuItem>
      </Ariakit.Menu>
    </Ariakit.MenuProvider>
  );
}
