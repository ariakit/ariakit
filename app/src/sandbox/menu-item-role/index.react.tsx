import * as Ariakit from "@ariakit/react";
import { useMenuItem } from "@ariakit/react-components/menu/menu-item";
import { useMenuList } from "@ariakit/react-components/menu/menu-list";
import { useMergeRefs } from "@ariakit/react-utils";
import { useLayoutEffect, useState } from "react";

function HookMenu() {
  const store = Ariakit.useMenuStore();
  const item = useMenuItem({ store });

  return (
    <>
      <Ariakit.MenuButton store={store}>Hook menu</Ariakit.MenuButton>
      <Ariakit.Menu store={store} render={<div role="listbox" />}>
        <Ariakit.Role {...item}>Hook item</Ariakit.Role>
      </Ariakit.Menu>
    </>
  );
}

function LayoutEffectMenu() {
  const [role, setRole] = useState<"tree" | undefined>("tree");

  useLayoutEffect(() => {
    setRole(undefined);
  }, []);

  return (
    <Ariakit.MenuProvider>
      <Ariakit.MenuList alwaysVisible render={<div role={role} />}>
        <Ariakit.MenuItem>Layout item</Ariakit.MenuItem>
      </Ariakit.MenuList>
    </Ariakit.MenuProvider>
  );
}

function MismatchedStoreMenu() {
  const itemStore = Ariakit.useMenuStore();
  const listStore = Ariakit.useMenuStore();

  return (
    <>
      <Ariakit.MenuList
        store={itemStore}
        alwaysVisible
        render={<div role="listbox" />}
      />
      <Ariakit.MenuList store={listStore} alwaysVisible>
        <Ariakit.MenuItem store={itemStore}>Mismatched item</Ariakit.MenuItem>
      </Ariakit.MenuList>
    </>
  );
}

function ReapplyRoleMenu() {
  const store = Ariakit.useMenuStore();
  const props = useMenuList({ store, alwaysVisible: true });
  const ref = useMergeRefs(props.ref, (element: HTMLDivElement | null) => {
    element?.setAttribute("role", "menu");
  });

  return (
    <Ariakit.Role {...props} ref={ref}>
      <Ariakit.MenuItem store={store}>Reapply item</Ariakit.MenuItem>
    </Ariakit.Role>
  );
}

export default function Example() {
  const [role, setRole] = useState<"menu" | "listbox" | "tree" | undefined>(
    "menu",
  );

  return (
    <>
      <Ariakit.MenuProvider>
        <Ariakit.MenuButton>Actions</Ariakit.MenuButton>
        <Ariakit.Menu
          hideOnInteractOutside={false}
          render={role === "tree" ? <ul role="tree" /> : <div role={role} />}
        >
          <Ariakit.MenuItem>Edit</Ariakit.MenuItem>
          <Ariakit.MenuItem>Share</Ariakit.MenuItem>
        </Ariakit.Menu>
      </Ariakit.MenuProvider>
      <Ariakit.Button onClick={() => setRole("listbox")}>
        Use listbox role
      </Ariakit.Button>
      <Ariakit.Button onClick={() => setRole("tree")}>
        Use tree role
      </Ariakit.Button>
      <Ariakit.Button onClick={() => setRole(undefined)}>
        Remove role
      </Ariakit.Button>
      <HookMenu />
      <LayoutEffectMenu />
      <MismatchedStoreMenu />
      <ReapplyRoleMenu />
    </>
  );
}
